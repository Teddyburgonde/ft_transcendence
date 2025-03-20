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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.Client = exports.ProxyRemote = exports.ProxyResult = exports.ProxyState = exports.EventEmitter = void 0;
const create_client_session_1 = __importDefault(require("./create-client-session"));
const create_server_session_1 = __importDefault(require("./create-server-session"));
var event_emitter_1 = require("./event-emitter");
Object.defineProperty(exports, "EventEmitter", { enumerable: true, get: function () { return __importDefault(event_emitter_1).default; } });
var proxy_state_1 = require("./proxy-state");
Object.defineProperty(exports, "ProxyState", { enumerable: true, get: function () { return __importDefault(proxy_state_1).default; } });
var proxy_result_1 = require("./proxy-result");
Object.defineProperty(exports, "ProxyResult", { enumerable: true, get: function () { return __importDefault(proxy_result_1).default; } });
var proxy_remote_1 = require("./proxy-remote");
Object.defineProperty(exports, "ProxyRemote", { enumerable: true, get: function () { return __importDefault(proxy_remote_1).default; } });
__exportStar(require("./types"), exports);
class Client {
    constructor(initializer, options = {}) {
        this._sessions = new Set();
        this._lastCancellation = Symbol();
        const registerSession = (session) => {
            this._sessions.add(session);
            session.onClose(() => this._sessions.delete(session));
        };
        let currentSession = null;
        const getSession = async () => {
            // If the current session is still open, re-use it.
            const promise = currentSession; // Save variable before "await"
            if (promise) {
                const session = await promise;
                if (session.isOpen())
                    return session;
            }
            // If the current session is not open (or there is no session), we
            // create a new one. Note that this if-statement protects against a
            // race condition where multiple calls to getSession() are made
            // concurrently and they both want to create new sessions (but we
            // should only create one new session at a time).
            if (currentSession === promise) {
                currentSession = (0, create_client_session_1.default)(initializer, options);
                currentSession.then(registerSession);
                currentSession.catch(() => { }); // Suppress "unhandledRejection"
            }
            return currentSession;
        };
        // This is the same as getSession() above, except it respects calls to
        // client.cancel() that may occur while creating a new session.
        this._getSession = async () => {
            const symbol = this._lastCancellation;
            const session = await getSession();
            if (symbol !== this._lastCancellation) {
                session.close();
                throw new Error('Runtime-RPC disconnected');
            }
            return session;
        };
    }
    // Grabs an available session and invokes a remote RPC method.
    async invoke(methodName, params, abortSignal) {
        const session = await this._getSession();
        return session.invoke(methodName, params, abortSignal);
    }
    // Closes all open sessions, cancelling all current requests.
    cancel() {
        this._lastCancellation = Symbol();
        for (const session of this._sessions) {
            session.close();
        }
    }
}
exports.Client = Client;
class Server {
    constructor(rpcMethods, options = {}) {
        this.options = options;
        this._sessions = new Set();
        this._lastShutdown = Symbol();
        this._rpcMethods = Object.assign(Object.create(null), rpcMethods);
    }
    // Adds a new session (connection) to the server.
    async newSession(initializer) {
        const symbol = this._lastShutdown;
        const session = await (0, create_server_session_1.default)(initializer, this._rpcMethods, this.options);
        if (symbol !== this._lastShutdown) {
            // If the server was shutdown while creating this session, close it.
            session.close();
        }
        else {
            this._sessions.add(session);
            session.onClose(() => this._sessions.delete(session));
        }
    }
    // Closes all open sessions, cancelling all current requests.
    shutdown() {
        this._lastShutdown = Symbol();
        for (const session of this._sessions) {
            session.close();
        }
    }
    get size() {
        return this._sessions.size;
    }
}
exports.Server = Server;
//# sourceMappingURL=index.js.map