"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTACH = void 0;
const proxy_state_1 = __importDefault(require("./proxy-state"));
exports.ATTACH = Symbol();
/*
    ProxyResult is used by servers to wrap an arbitrary object and send it to
    the client as a proxy. After being sent, the client can continue to access
    the proxy remotely as long as it remains connected.
*/
class ProxyResult extends proxy_state_1.default {
    constructor(target) {
        if (target == null) {
            throw new TypeError('ProxyResult cannot wrap null or undefined');
        }
        super();
        this._hooks = null;
        this._target = target;
    }
    get target() {
        return this._target;
    }
    _connected() {
        return this._hooks?.connected() ?? false;
    }
    _disconnect(err) {
        this._hooks?.disconnect(err);
    }
    static [exports.ATTACH](proxy, hooks) {
        if (proxy._hooks) {
            throw new TypeError('Cannot send the same ProxyResult twice');
        }
        if (proxy._closed) {
            hooks.disconnect(proxy._error);
        }
        else {
            proxy._hooks = hooks;
        }
    }
}
exports.default = ProxyResult;
//# sourceMappingURL=proxy-result.js.map