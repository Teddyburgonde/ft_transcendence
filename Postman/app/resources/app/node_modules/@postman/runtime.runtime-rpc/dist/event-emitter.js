"use strict";
/*
    This class implements a subset of the Node.js EventEmitter.
*/
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = void 0;
exports.EVENTS = Symbol('events');
class EventEmitter {
    constructor() {
        this[_a] = new Map();
    }
    emit(event, ...args) {
        const listeners = this[exports.EVENTS].get(event);
        if (listeners) {
            for (const listener of listeners.slice()) {
                listener.apply(this, args);
            }
            return true;
        }
        return false;
    }
    addListener(event, listener) {
        let listeners = this[exports.EVENTS].get(event);
        if (!listeners) {
            listeners = [];
            this[exports.EVENTS].set(event, listeners);
        }
        listeners.push(listener);
        return this;
    }
    removeListener(event, listener) {
        let listeners = this[exports.EVENTS].get(event);
        if (listeners) {
            for (let i = 0; i < listeners.length; ++i) {
                if (listeners[i] === listener) {
                    if (listeners.length > 1) {
                        listeners.splice(i, 1);
                    }
                    else {
                        this[exports.EVENTS].delete(event);
                    }
                    break;
                }
            }
        }
        return this;
    }
    on(event, listener) {
        return this.addListener(event, listener);
    }
    off(event, listener) {
        return this.removeListener(event, listener);
    }
}
_a = exports.EVENTS;
exports.default = EventEmitter;
//# sourceMappingURL=event-emitter.js.map