"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const electron_1 = require("electron");
const runtime_runtime_rpc_1 = require("@postman/runtime.runtime-rpc"); // prettier-ignore
class Server {
    constructor(rpcMethods, options = {}) {
        const { ipc = electron_1.ipcMain, channel = '@postman/runtime' } = options;
        this._closed = false;
        this._ipc = ipc;
        this._ipcChannel = channel;
        this._ipcListener = Server.createIPCListener(this);
        this._rpcSessions = new Map();
        this._rpcServer = new runtime_runtime_rpc_1.Server(rpcMethods);
        this._ipc.on(this._ipcChannel, this._ipcListener);
    }
    close() {
        if (!this._closed) {
            this._closed = true;
            this._ipc.removeListener(this._ipcChannel, this._ipcListener);
            this._rpcServer.shutdown();
        }
    }
    get channel() {
        return this._ipcChannel;
    }
    get size() {
        return this._rpcServer.size;
    }
    get closed() {
        return this._closed;
    }
    static createIPCListener(server) {
        return (event, msg) => {
            if (msg == null) {
                return;
            }
            const { op, sessionId } = msg;
            if (typeof op !== 'string' || typeof sessionId !== 'string') {
                return;
            }
            if (op === 'connect') {
                const send = event.reply.bind(event, server._ipcChannel);
                Server.registerSession(server, sessionId, send).then(() => {
                    send({ op: 'connect', sessionId });
                }, (error) => {
                    send({ op: 'connect', sessionId, error });
                });
            }
            else if (op === 'disconnect') {
                const controller = server._rpcSessions.get(sessionId);
                if (controller) {
                    server._rpcSessions.delete(sessionId);
                    controller.destroy();
                }
            }
            else if (op === 'message') {
                const controller = server._rpcSessions.get(sessionId);
                if (controller) {
                    controller.receive(msg.data);
                }
            }
        };
    }
    static async registerSession(server, sessionId, send) {
        await server._rpcServer.newSession((controller) => {
            if (server._rpcSessions.has(sessionId)) {
                throw new Error('Session ID already in use');
            }
            server._rpcSessions.set(sessionId, controller);
            return {
                send(data) {
                    send({ op: 'message', sessionId, data });
                },
                close() {
                    send({ op: 'disconnect', sessionId });
                    server._rpcSessions.delete(sessionId);
                    controller.destroy();
                },
                isOpen() {
                    return server._rpcSessions.has(sessionId);
                },
            };
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=index.js.map