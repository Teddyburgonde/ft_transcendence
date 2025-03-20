"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERNAL = void 0;
const proxy_state_1 = __importDefault(require("./proxy-state"));
const event_emitter_1 = __importDefault(require("./event-emitter"));
exports.INTERNAL = Symbol();
/*
    ProxyRemote is used by clients to represent a remote (proxied) object sent
    by the server. The client can use it to access the remote object as long as
    it remains connected. For convenience, it can be converted to an actual
    JavaScript Proxy, which is also an EventEmitter.
*/
class ProxyRemote extends proxy_state_1.default {
    constructor(internal, hooks) {
        if (internal !== exports.INTERNAL) {
            throw new TypeError('Illegal construction');
        }
        super();
        this._hooks = hooks;
        this._events = new event_emitter_1.default();
    }
    get events() {
        return this._events;
    }
    call(method, ...data) {
        return this._hooks.call(method, ...data);
    }
    toProxy(unidirectionalMethods = [], bidirectionalMethods = []) {
        const methods = new Map();
        const methodNames = new Set([
            ...unidirectionalMethods,
            ...bidirectionalMethods,
        ]);
        return new Proxy(Object.freeze({}), {
            get: (_, property) => {
                if (property === 'remote') {
                    return this;
                }
                if (property in this._events) {
                    return this._events[property];
                }
                if (typeof property === 'string' && methodNames.has(property)) {
                    let fn = methods.get(property);
                    if (!fn) {
                        fn = this.call.bind(this, property);
                        if (unidirectionalMethods.includes(property)) {
                            fn = ignoreReturnvalue(fn, this);
                        }
                        methods.set(property, fn);
                    }
                    return fn;
                }
                return undefined;
            },
        });
    }
    _connected() {
        return this._hooks.connected();
    }
    _disconnect(err) {
        this._hooks.disconnect(err);
    }
}
exports.default = ProxyRemote;
// Some proxied methods are more convenient if they are treated like one-way
// events, where there is no return value and we don't care about disconnection.
// This wraps a given function to provide that behavior.
function ignoreReturnvalue(fn, proxy) {
    return (...data) => {
        if (!proxy.connected)
            return;
        fn(...data).catch(() => { });
    };
}
//# sourceMappingURL=proxy-remote.js.map