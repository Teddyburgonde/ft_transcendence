"use strict";
/*
    An EventChannel is a bidrectional communication channel that communicates
    with its peer by sending and receiving standardized events. Each event has a
    type (string), a timestamp (ISO-formatted string), and a payload (anything).

    An EventChannel is meant to be "linked" with another EventChannel, causing
    any events sent on one to be received on the other, and vice-versa. Each
    EventChannel can only have one linked peer at a time. Unless a peer is
    linked, EventChannels will queue any events that they emit.

    EventChannels can be "closed", after which they cannot send or receive any
    more events. When an EventChannel is closed, its linked peer is also closed,
    which prevents resource leaks and unnecessary tasks continuing after the
    user is no longer interested in them. EventChannels can register "cleanup"
    callbacks which will be invoked when the EventChannel becomes closed.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventChannel = void 0;
class EventChannel {
    constructor() {
        this.isClosed = false;
        this.peer = null;
        this.eventQueue = [];
        this.eventHandlers = [];
        this.cleanupCallbacks = [];
    }
    receive(event) {
        if (this.isClosed) {
            return;
        }
        for (const handler of this.eventHandlers) {
            // Handle events in their own event loop ticks.
            Promise.resolve(event).then(handler.wrapped);
        }
    }
    get closed() {
        return this.isClosed;
    }
    on(eventType, callback) {
        if (this.isClosed) {
            return this;
        }
        const wrapped = (event) => {
            if (!this.isClosed && event.type === eventType) {
                callback(event);
            }
        };
        this.eventHandlers.push({ wrapped, original: callback, eventType });
        return this;
    }
    off(eventType, callback) {
        for (let i = 0; i < this.eventHandlers.length; ++i) {
            const handler = this.eventHandlers[i];
            if (handler.original === callback && handler.eventType === eventType) {
                this.eventHandlers.splice(i, 1);
                break;
            }
        }
        return this;
    }
    onAll(callback) {
        if (this.isClosed) {
            return this;
        }
        const wrapped = (event) => {
            if (!this.isClosed) {
                callback(event);
            }
        };
        this.eventHandlers.push({ wrapped, original: callback, eventType: null });
        return this;
    }
    offAll(callback) {
        for (let i = 0; i < this.eventHandlers.length; ++i) {
            const handler = this.eventHandlers[i];
            if (handler.original === callback && handler.eventType === null) {
                this.eventHandlers.splice(i, 1);
                break;
            }
        }
        return this;
    }
    onCleanup(callback) {
        if (this.isClosed) {
            Promise.resolve().then(callback); // Already closed; cleanup immediately
        }
        else {
            this.cleanupCallbacks.push(callback);
        }
        return this;
    }
    offCleanup(callback) {
        const index = this.cleanupCallbacks.indexOf(callback);
        if (index !== -1) {
            this.cleanupCallbacks.splice(index, 1);
        }
        return this;
    }
    send(event) {
        if (this.isClosed) {
            return;
        }
        if (this.peer) {
            this.peer.receive(event);
        }
        else {
            this.eventQueue.push(event);
        }
    }
    emit(eventType, payload) {
        this.send({
            type: eventType,
            timestamp: new Date().toISOString(),
            payload,
        });
    }
    async emitSelf(eventType, payload) {
        // The user might want to call close() immediately after emitSelf(),
        // which would prevent this event from actually being emitted, since
        // events are emitted asynchronously. Therefore, we await a Promise,
        // giving the user an opportunity to wait until a point when the event
        // has actually been emitted.
        await new Promise((resolve) => {
            this.on(eventType, resolve);
            this.receive({
                type: eventType,
                timestamp: new Date().toISOString(),
                payload,
            });
            this.off(eventType, resolve);
        });
    }
    close() {
        if (this.isClosed) {
            return;
        }
        this.isClosed = true;
        this.eventHandlers = [];
        while (this.cleanupCallbacks.length) {
            // Handle cleanup callbacks in their own event loop ticks.
            Promise.resolve().then(this.cleanupCallbacks.shift());
        }
        // Closing an EventChannel causes its peer to close too, but we do it
        // asynchronously so events emitted earlier in the tick are still sent.
        // Also, it's important to do this after all cleanup callbacks, so the
        // cleanup callbacks have a chance to unlink the peer, if desired.
        const peer = this.peer;
        if (peer && !peer.isClosed) {
            Promise.resolve().then(() => {
                // The peer can change, so we make sure it's the same peer.
                if (peer === this.peer) {
                    peer.close();
                }
            });
        }
    }
    link(peer) {
        if (this.peer) {
            throw new TypeError('This EventChannel already has a linked peer');
        }
        if (peer.peer) {
            throw new TypeError('The peer EventChannel already has a linked peer');
        }
        this.peer = peer;
        peer.peer = this;
        while (this.eventQueue.length) {
            peer.receive(this.eventQueue.shift());
        }
        while (peer.eventQueue.length) {
            this.receive(peer.eventQueue.shift());
        }
        // Closing an EventChannel causes its peer to close too, but we do it
        // asynchronously so events emitted earlier in the tick are still sent.
        if (this.isClosed !== peer.isClosed) {
            Promise.resolve().then(() => {
                // The peers can change, so we make sure they're the same.
                if (peer === this.peer) {
                    peer.close();
                    this.close();
                }
            });
        }
    }
    unlink(peer) {
        // We require that the linked peer be passed explicitly, to prevent
        // against race conditions of linking/unlinking/re-linking.
        if (this.peer !== peer) {
            return;
        }
        peer.peer = null;
        this.peer = null;
    }
}
exports.EventChannel = EventChannel;
(function (EventChannel) {
    function specific(channel) {
        return channel;
    }
    EventChannel.specific = specific;
})(EventChannel || (exports.EventChannel = EventChannel = {}));
//# sourceMappingURL=index.js.map