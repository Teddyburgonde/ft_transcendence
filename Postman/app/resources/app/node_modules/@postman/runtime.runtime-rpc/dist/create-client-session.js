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
const proxy_remote_1 = __importStar(require("./proxy-remote"));
const incrementor_1 = __importDefault(require("./incrementor"));
const msgpack_1 = __importDefault(require("./msgpack"));
const timer_1 = __importDefault(require("./timer"));
const CONNECTION_TIMEOUT = 1000 * 15;
const NOOP = () => { };
async function createClientSession(initializer, options = {}) {
    const { timeout = CONNECTION_TIMEOUT } = options;
    let state = State.OPENING;
    let isIdle = false;
    let parseError = null;
    let onClose = NOOP;
    const requests = new Map();
    const proxies = new Map();
    // Initialize the underlying connection, and allow the underlying transport
    // layer to receive Runtime-RPC messages and to destroy this ClientSession.
    const connection = await initializer({
        receive(rawMsg) {
            if (state !== State.OPEN)
                return;
            timer.reset(); // The connection is okay
            let msg;
            try {
                msg = (0, parse_message_1.default)(rawMsg, requests, proxies);
            }
            catch (err) {
                parseError = err;
                terminateConnection('PROTOCOL_VIOLATION');
                return;
            }
            if (msg) {
                handlers[msg.op](msg);
            }
        },
        destroy(cause = null) {
            if (state === State.CLOSED)
                return;
            if (state === State.OPENING) {
                state = State.CLOSED;
                return;
            }
            state = State.CLOSED;
            let err;
            if (requests.size || proxies.size) {
                err = new Error('Runtime-RPC disconnected');
                if (parseError !== null || cause !== null) {
                    err.cause = parseError || cause;
                }
            }
            // Abort any pending requests.
            for (const [requestId, request] of requests) {
                requests.delete(requestId);
                request.cleanup();
                request.reject(err);
            }
            // Disconnect all proxies.
            for (const [pid, { proxy }] of proxies) {
                proxies.delete(pid);
                proxy.disconnect(err);
            }
            // Clean up resources.
            timer.stop();
            onClose();
        },
    });
    if (state !== State.OPENING || !connection.isOpen()) {
        throw new Error('Connection was closed before being opened');
    }
    state = State.OPEN;
    updateIdleness();
    const incrementor = new incrementor_1.default();
    const timer = new timer_1.default(timeout, () => {
        terminateConnection('TIMEOUT');
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
    // The session is considered idle if there are no pending requests or open
    // proxy objects. Some implementations may be interested in knowing if the
    // session is idle (for example, to keep the process alive in Node.js).
    function updateIdleness() {
        const idleness = !requests.size && !proxies.size;
        if (isIdle !== idleness) {
            isIdle = idleness;
            if (idleness) {
                connection.onIdle?.();
            }
            else {
                connection.onActive?.();
            }
        }
    }
    // This sends a request to the server to invoke a top-level RPC method.
    function invokeRPCMethod(methodName, data = {}, abortSignal) {
        return new Promise((resolve, reject) => {
            abortSignal?.throwIfAborted();
            // Sanitize inputs, for non-TypeScript applications.
            methodName = String(methodName);
            data = Object.assign({}, data);
            const requestId = incrementor.next();
            const request = { resolve, reject, cleanup: NOOP };
            sendMessage({ op: 'req', id: requestId, method: methodName, data });
            requests.set(requestId, request);
            if (abortSignal) {
                const onAbort = () => {
                    if (requests.delete(requestId)) {
                        request.cleanup();
                        request.reject(abortSignal.reason);
                        updateIdleness();
                        sendMessage({ op: 'cancel', id: requestId });
                    }
                };
                abortSignal.addEventListener('abort', onAbort);
                request.cleanup = () => {
                    abortSignal.removeEventListener('abort', onAbort);
                };
            }
            updateIdleness();
        });
    }
    // This sets up a response payload so that (if a proxy is being received)
    // the proxy is registered with the session, assigned to the given "pid",
    // and returned to the user as a ProxyRemote object.
    function prepareProxy({ remote, ...data }) {
        if (remote == null) {
            return data;
        }
        const pid = remote;
        const proxyRequests = new Set();
        const proxy = new proxy_remote_1.default(proxy_remote_1.INTERNAL, {
            connected() {
                return proxies.has(pid);
            },
            disconnect(err) {
                if (proxies.delete(pid)) {
                    sendMessage(withError({ op: 'pclose', pid }, err));
                }
                for (const requestId of proxyRequests) {
                    const request = requests.get(requestId);
                    if (request) {
                        requests.delete(requestId);
                        request.cleanup();
                        request.reject(new Error('Runtime-RPC proxy object was closed'));
                    }
                }
                updateIdleness();
            },
            call(method, ...data) {
                return new Promise((resolve, reject) => {
                    if (!proxies.has(pid)) {
                        throw new Error('Runtime-RPC proxy object is closed');
                    }
                    const requestId = incrementor.next();
                    const request = { resolve, reject, cleanup: NOOP };
                    sendMessage({ op: 'preq', pid, id: requestId, method, data });
                    requests.set(requestId, request);
                    proxyRequests.add(requestId);
                    request.cleanup = () => proxyRequests.delete(requestId);
                    updateIdleness();
                });
            },
        });
        proxies.set(pid, { proxy, requests: proxyRequests });
        return { ...data, remote: proxy };
    }
    function discardProxy({ remote }) {
        if (remote != null) {
            sendMessage({ op: 'pclose', pid: remote });
        }
    }
    // These handlers are used to react to messages received from the client.
    const handlers = {
        req() {
            terminateConnection('PROTOCOL_VIOLATION');
        },
        res(msg) {
            const request = requests.get(msg.id);
            if (request) {
                requests.delete(msg.id);
                request.cleanup();
                if ('data' in msg) {
                    request.resolve(prepareProxy(msg.data));
                }
                else {
                    request.reject(msg.error);
                }
                updateIdleness();
            }
            else if ('data' in msg) {
                discardProxy(msg.data);
            }
        },
        preq() {
            terminateConnection('PROTOCOL_VIOLATION');
        },
        pres(msg) {
            const request = requests.get(msg.id);
            if (request) {
                requests.delete(msg.id);
                request.cleanup();
                if ('data' in msg) {
                    request.resolve(msg.data);
                }
                else {
                    request.reject(msg.error);
                }
                updateIdleness();
            }
        },
        pevent({ pid, event, data }) {
            const proxyInfo = proxies.get(pid);
            if (proxyInfo) {
                proxyInfo.proxy.events.emit(event, ...data);
            }
        },
        pclose({ pid, error }) {
            const proxyInfo = proxies.get(pid);
            if (proxyInfo) {
                proxies.delete(pid);
                proxyInfo.proxy.disconnect(error);
                updateIdleness();
            }
        },
        cancel() {
            terminateConnection('PROTOCOL_VIOLATION');
        },
        hi() {
            sendMessage({ op: 'hi' });
        },
    };
    return {
        invoke: invokeRPCMethod,
        close: () => terminateConnection('NORMAL'),
        isOpen: () => state === State.OPEN && connection.isOpen(),
        onClose: (fn) => {
            onClose = fn;
        },
    };
}
exports.default = createClientSession;
var State;
(function (State) {
    State[State["OPENING"] = 0] = "OPENING";
    State[State["OPEN"] = 1] = "OPEN";
    State[State["CLOSING"] = 2] = "CLOSING";
    State[State["CLOSED"] = 3] = "CLOSED";
})(State || (State = {}));
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
//# sourceMappingURL=create-client-session.js.map