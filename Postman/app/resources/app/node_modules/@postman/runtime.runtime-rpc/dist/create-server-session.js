"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_message_1 = __importDefault(require("./parse-message"));
const proxy_result_1 = __importStar(require("./proxy-result"));
const incrementor_1 = __importDefault(require("./incrementor"));
const heartbeat_1 = __importDefault(require("./heartbeat"));
const msgpack_1 = __importDefault(require("./msgpack"));
const HEARTBEAT_INTERVAL = 1000 * 3;
const HEARTBEAT_TRIES = 3;
const NOOP = () => { };
async function createServerSession(initializer, rpcMethods, options = {}) {
    const { interval: heartbeatInterval = HEARTBEAT_INTERVAL, tries: heartbeatTries = HEARTBEAT_TRIES, } = options?.heartbeat ?? {};
    let state = State.OPENING;
    let onClose = NOOP;
    const requests = new Map();
    const proxies = new Map();
    // Initialize the underlying connection, and allow the underlying transport
    // layer to receive Runtime-RPC messages and to destroy this ServerSession.
    const connection = await initializer({
        receive(rawMsg) {
            if (state !== State.OPEN)
                return;
            if (requests.size || proxies.size) {
                heartbeat.reset(); // The connection is not idle
            }
            let msg;
            try {
                msg = (0, parse_message_1.default)(rawMsg, requests, proxies);
            }
            catch (_) {
                terminateConnection('PROTOCOL_VIOLATION');
                return;
            }
            if (msg) {
                handlers[msg.op](msg);
            }
        },
        destroy() {
            if (state === State.CLOSED)
                return;
            if (state === State.OPENING) {
                state = State.CLOSED;
                return;
            }
            state = State.CLOSED;
            // Abort any pending requests.
            for (const [requestId, request] of requests) {
                requests.delete(requestId);
                request.cleanup();
                request.abortController.abort();
            }
            // Disconnect all proxies.
            for (const [pid, { proxy }] of proxies) {
                proxies.delete(pid);
                proxy.disconnect();
            }
            // Clean up resources.
            heartbeat.stop();
            onClose();
        },
    });
    if (state !== State.OPENING || !connection.isOpen()) {
        throw new Error('Connection was closed before being opened');
    }
    state = State.OPEN;
    const session = {};
    const incrementor = new incrementor_1.default();
    const heartbeat = new heartbeat_1.default(heartbeatInterval, heartbeatTries, (isHeartbeatFailure) => {
        if (isHeartbeatFailure) {
            terminateConnection('TIMEOUT');
        }
        else {
            sendMessage({ op: 'hi' });
        }
    });
    function sendMessage(msg) {
        if (state === State.OPEN) {
            connection.send(msgpack_1.default.encode(msg));
        }
    }
    function terminateConnection(reason) {
        if (state === State.OPEN) {
            state = State.CLOSING;
            connection.close(reason);
        }
    }
    // This invokes a top-level RPC method that the client requested.
    function invokeRPCMethod(requestId, methodName, data, ctx) {
        new Promise((resolve) => {
            resolve((rpcMethods[methodName] || methodNotFound)(data, ctx));
        })
            .then((returnValue) => {
            const request = requests.get(requestId);
            if (request) {
                requests.delete(requestId);
                request.cleanup();
                const data = prepareProxy(Object.assign({}, returnValue));
                sendMessage({ op: 'res', id: requestId, data });
            }
            else {
                discardProxy(Object.assign({}, returnValue));
            }
        })
            .catch((err) => {
            const request = requests.get(requestId);
            if (request) {
                requests.delete(requestId);
                request.cleanup();
                const error = err instanceof Error ? err : new Error(String(err));
                sendMessage({ op: 'res', id: requestId, error });
            }
        });
    }
    // This invokes a method on a proxy that was previously sent to the client.
    function invokeProxyMethod(requestId, methodName, data, proxyInfo) {
        new Promise((resolve) => {
            resolve(proxyInfo.proxy.target[methodName](...data));
        })
            .then((data) => {
            const request = requests.get(requestId);
            if (request) {
                requests.delete(requestId);
                request.cleanup();
                sendMessage({ op: 'pres', id: requestId, data });
            }
        })
            .catch((err) => {
            const request = requests.get(requestId);
            if (request) {
                requests.delete(requestId);
                request.cleanup();
                const error = err instanceof Error ? err : new Error(String(err));
                sendMessage({ op: 'pres', id: requestId, error });
            }
        });
    }
    // This sets up a response payload so that (if a proxy is being sent) the
    // proxy is registered with the session, assigned a unique "pid", and set up
    // to forward events to the client (if it looks like an EventEmitter).
    function prepareProxy({ remote, ...data }) {
        if (remote == null) {
            return data;
        }
        const pid = incrementor.next();
        const proxyRequests = new Set();
        const proxy = remote instanceof proxy_result_1.default ? remote : new proxy_result_1.default(remote);
        const { target } = proxy;
        const { emit } = target;
        if (typeof emit === 'function') {
            target.addListener('error', NOOP);
            target.emit = (event, ...data) => {
                sendMessage({ op: 'pevent', pid, event, data });
                return emit.call(target, event, ...data);
            };
        }
        proxy_result_1.default[proxy_result_1.ATTACH](proxy, {
            connected() {
                return proxies.has(pid);
            },
            disconnect(err) {
                if (proxies.delete(pid)) {
                    sendMessage(withError({ op: 'pclose', pid }, err));
                }
                if (typeof emit === 'function') {
                    target.emit = emit;
                    target.removeListener('error', NOOP);
                }
                for (const requestId of proxyRequests) {
                    const request = requests.get(requestId);
                    if (request) {
                        requests.delete(requestId);
                        request.cleanup();
                        request.abortController.abort();
                    }
                }
            },
        });
        proxies.set(pid, { proxy, requests: proxyRequests });
        return { ...data, remote: pid };
    }
    function discardProxy({ remote }) {
        if (remote instanceof proxy_result_1.default) {
            remote.disconnect();
        }
    }
    // These handlers are used to react to messages received from the client.
    const handlers = {
        req({ id, method, data }) {
            const abortController = new AbortController();
            const request = { abortController, cleanup: NOOP };
            const ctx = { signal: abortController.signal, session };
            requests.set(id, request);
            invokeRPCMethod(id, method, data, ctx);
            heartbeat.reset(); // The connection is not idle
        },
        res() {
            terminateConnection('PROTOCOL_VIOLATION');
        },
        preq({ pid, id, method, data }) {
            const proxyInfo = proxies.get(pid);
            if (proxyInfo) {
                const abortController = new AbortController();
                const request = { abortController, cleanup: NOOP };
                requests.set(id, request);
                proxyInfo.requests.add(id);
                request.cleanup = () => proxyInfo.requests.delete(id);
                invokeProxyMethod(id, method, data, proxyInfo);
                heartbeat.reset(); // The connection is not idle
            }
        },
        pres() {
            terminateConnection('PROTOCOL_VIOLATION');
        },
        pevent() {
            terminateConnection('PROTOCOL_VIOLATION');
        },
        pclose({ pid, error }) {
            const proxyInfo = proxies.get(pid);
            if (proxyInfo) {
                proxies.delete(pid);
                proxyInfo.proxy.disconnect(error);
            }
        },
        cancel({ id }) {
            const request = requests.get(id);
            if (request) {
                requests.delete(id);
                request.cleanup();
                request.abortController.abort();
            }
        },
        hi() {
            // No-op
        },
    };
    return {
        close: () => terminateConnection('NORMAL'),
        onClose: (fn) => {
            onClose = fn;
        },
    };
}
exports.default = createServerSession;
var State;
(function (State) {
    State[State["OPENING"] = 0] = "OPENING";
    State[State["OPEN"] = 1] = "OPEN";
    State[State["CLOSING"] = 2] = "CLOSING";
    State[State["CLOSED"] = 3] = "CLOSED";
})(State || (State = {}));
function methodNotFound() {
    throw new Error('Method not found');
}
// This ensures the type-safety of "pclose" for non-TypeScript applications.
function withError(msg, err) {
    if (err != null) {
        if (err instanceof Error) {
            msg.error = err;
        }
        else {
            msg.error = new Error(String(err));
        }
    }
    return msg;
}
//# sourceMappingURL=create-server-session.js.map