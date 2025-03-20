"use strict";
/*
    ProxyState is the interface used by both clients and servers to inspect
    whether a "proxy object" is connected, to disconnect the proxy object when
    desired, and to register callbacks for when the proxy object disconnects.
*/
Object.defineProperty(exports, "__esModule", { value: true });
class ProxyState {
    constructor() {
        this._cleanupCallbacks = [];
        this._closed = false;
        this._error = undefined;
    }
    onCleanup(fn) {
        if (!this._closed) {
            this._cleanupCallbacks.push(fn);
        }
        else {
            Promise.resolve(this._error).then(fn);
        }
    }
    offCleanup(fn) {
        const arr = this._cleanupCallbacks;
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i] === fn) {
                arr.splice(i, 1);
                break;
            }
        }
    }
    disconnect(err) {
        if (!this._closed) {
            this._closed = true;
            this._error = err;
            this._disconnect(err);
            while (this._cleanupCallbacks.length) {
                // Handle cleanup callbacks in their own event loop ticks.
                Promise.resolve(err).then(this._cleanupCallbacks.shift());
            }
        }
    }
    get connected() {
        return !this._closed && this._connected();
    }
}
exports.default = ProxyState;
//# sourceMappingURL=proxy-state.js.map