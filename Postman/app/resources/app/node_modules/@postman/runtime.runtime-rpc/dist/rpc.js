"use strict";
/// <Reference lib="DOM" />
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Client_calls, _Client_incrementor, _Server_calls;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.Client = exports.rpc = void 0;
const incrementor_1 = __importDefault(require("./incrementor"));
const message_1 = require("./message");
/**
 * Create an RPC proxy interface with the given connection
 *
 * @example
 * ```ts
 * import { rpc } from '...';
 *
 * interface API {
 *   sayHello(data: { name: string }): Promise<{ greeting: string }>;
 * }
 *
 * const connection = ...
 * const api = rpc<API>(connection);
 *
 * const { greeting } = await api.sayHello({ name: '...' });
 * ```
 * @param {Connection} connection
 */
function rpc(connection) {
    const client = new Client(connection);
    return new Proxy(client, {
        get(target, property) {
            if (property === '$client') {
                return client;
            }
            return (data, options) => {
                return target.call(String(property), data, options);
            };
        },
    });
}
exports.rpc = rpc;
class Client {
    constructor(connection) {
        this.connection = connection;
        _Client_calls.set(this, new Map());
        _Client_incrementor.set(this, new incrementor_1.default());
        connection.on('message', ({ detail: message }) => {
            if (message.op === 'res') {
                const remote = __classPrivateFieldGet(this, _Client_calls, "f").get(message.id);
                if (!remote)
                    return;
                __classPrivateFieldGet(this, _Client_calls, "f").delete(message.id);
                remote.cleanup();
                if ('error' in message) {
                    remote.reject(message.error);
                }
                else {
                    remote.resolve(message.data);
                }
            }
        });
        connection.on('close', () => {
            for (const id of __classPrivateFieldGet(this, _Client_calls, "f").keys()) {
                this.cancel(id, new Error('Connection closed'));
            }
        });
    }
    async call(method, data, options = {}) {
        const { signal } = options;
        return new Promise((resolve, reject) => {
            signal?.throwIfAborted();
            const id = __classPrivateFieldGet(this, _Client_incrementor, "f").next();
            const request = message_1.messages.request(id, method, data);
            const abort = () => {
                this.cancel(id, signal.reason);
                this.connection.send(message_1.messages.cancel(id));
            };
            signal?.addEventListener('abort', abort);
            const cleanup = () => {
                signal?.removeEventListener('abort', abort);
            };
            __classPrivateFieldGet(this, _Client_calls, "f").set(id, { resolve, reject, cleanup });
            this.connection.send(request);
        });
    }
    cancel(id, reason) {
        const call = __classPrivateFieldGet(this, _Client_calls, "f").get(id);
        if (!call)
            return;
        __classPrivateFieldGet(this, _Client_calls, "f").delete(id);
        call.cleanup();
        call.reject(reason);
    }
}
exports.Client = Client;
_Client_calls = new WeakMap(), _Client_incrementor = new WeakMap();
class Server {
    constructor(connection, methods) {
        this.connection = connection;
        this.methods = methods;
        _Server_calls.set(this, new Map());
        connection.on('message', ({ detail: message }) => {
            if (message.op === 'req') {
                const { id, method, data } = message;
                this.call(id, method, data);
            }
            else if (message.op === 'cancel') {
                __classPrivateFieldGet(this, _Server_calls, "f").get(message.id)?.controller.abort();
            }
        });
        connection.on('close', () => {
            for (const id of __classPrivateFieldGet(this, _Server_calls, "f").keys()) {
                this.cancel(id);
            }
        });
    }
    call(id, method, data) {
        if (__classPrivateFieldGet(this, _Server_calls, "f").has(id)) {
            // TODO send error message about re-used id
            return;
        }
        if (!(method in this.methods)) {
            this.connection.send(message_1.messages.failure(id, new Error(`Unknown method "${method}"`)));
            return;
        }
        const controller = new AbortController();
        __classPrivateFieldGet(this, _Server_calls, "f").set(id, { controller });
        (async () => {
            const result = await this.methods[method](data, {
                signal: controller.signal,
            });
            // The only cases where a method has been aborted are cancellation
            // from the connection closing (error or close).
            //
            // Rely on other side to cancel requests on close
            // (can't send failure messages anyways, the connection is closed)
            if (!controller.signal.aborted) {
                this.connection.send(message_1.messages.success(id, result));
            }
        })()
            .catch((error) => {
            if (!controller.signal.aborted) {
                this.connection.send(message_1.messages.failure(id, error));
            }
        })
            .finally(() => {
            __classPrivateFieldGet(this, _Server_calls, "f").delete(id);
        });
    }
    cancel(id) {
        const call = __classPrivateFieldGet(this, _Server_calls, "f").get(id);
        if (!call)
            return;
        __classPrivateFieldGet(this, _Server_calls, "f").delete(id);
        call.controller.abort();
    }
    close() {
        this.connection.close();
    }
}
exports.Server = Server;
_Server_calls = new WeakMap();
//# sourceMappingURL=rpc.js.map