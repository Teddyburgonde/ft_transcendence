"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const runtime_runtime_rpc_1 = require("@postman/runtime.runtime-rpc");
const electron_1 = require("electron");
const deferred_1 = require("./deferred");
const channels = new Map();
const CONNECTION_TIMEOUT = 1000 * 10;
class Client extends runtime_runtime_rpc_1.Client {
    constructor(options = {}) {
        const { ipc = electron_1.ipcRenderer, channel = '@postman/runtime' } = options;
        super(async (controller) => {
            const sessionId = await connect(ipc, channel, controller);
            const { sessions } = channels.get(channel);
            return {
                send: (data) => {
                    ipc.send(channel, { op: 'message', sessionId, data });
                },
                close: () => {
                    ipc.send(channel, { op: 'disconnect', sessionId });
                    disconnect(ipc, channel, sessionId);
                },
                isOpen() {
                    return sessions.has(sessionId);
                },
            };
        });
        this._ipcChannel = channel;
    }
    get channel() {
        return this._ipcChannel;
    }
}
exports.Client = Client;
function createIPCListener(ipc, channel, sessions) {
    return (_event, msg) => {
        if (msg == null) {
            return;
        }
        const { op, sessionId } = msg;
        if (typeof op !== 'string' || typeof sessionId !== 'string') {
            return;
        }
        if (op === 'connect') {
            const session = sessions.get(sessionId);
            if (session && session.handshake) {
                if (msg.error == null) {
                    session.handshake.resolve();
                    session.handshake = null;
                }
                else {
                    session.handshake.reject(msg.error);
                    session.handshake = null;
                }
            }
        }
        else if (op === 'disconnect') {
            const session = sessions.get(sessionId);
            if (session && !session.handshake) {
                disconnect(ipc, channel, sessionId);
            }
        }
        else if (op === 'message') {
            const session = sessions.get(sessionId);
            if (session && !session.handshake) {
                session.controller.receive(msg.data);
            }
        }
    };
}
// Creates a session and connects to the server over the specified IPC channel.
// Electron IPC has no concept of a "connection", so we create a pseudo-
// "connection" via a simple handshake where we pass a unique ID to the server
// and wait for a confirmation message. The concept of a "connection" is
// important because multiple clients can be used simultaneously.
async function connect(ipc, channel, controller) {
    const channelScope = getChannelScope(ipc, channel);
    const sessionId = `${Date.now()}|${Math.random()}`;
    const handshake = (0, deferred_1.createDeferrred)(CONNECTION_TIMEOUT);
    const session = { controller, handshake };
    channelScope.sessions.set(sessionId, session);
    ipc.send(channel, { op: 'connect', sessionId });
    try {
        await handshake.promise;
    }
    catch (err) {
        disconnect(ipc, channel, sessionId);
        throw err;
    }
    return sessionId;
}
// Deletes a session from the specified IPC channel and destroys the session.
// If the session is the IPC channel's last associated session, the ChannelScope
// is also destroyed.
function disconnect(ipc, channel, sessionId) {
    const channelScope = channels.get(channel);
    if (channelScope) {
        const { sessions } = channelScope;
        const session = sessions.get(sessionId);
        if (session) {
            sessions.delete(sessionId);
            if (!sessions.size) {
                ipc.removeListener(channel, channelScope.listener);
                channels.delete(channel);
            }
            session.controller.destroy();
        }
    }
}
// Returns the ChannelScope for the specified IPC channel. The ChannelScope is
// created if it does not yet exist.
function getChannelScope(ipc, channel) {
    let channelScope = channels.get(channel);
    if (!channelScope) {
        const sessions = new Map();
        const listener = createIPCListener(ipc, channel, sessions);
        channelScope = { listener, sessions };
        ipc.on(channel, listener);
        channels.set(channel, channelScope);
    }
    return channelScope;
}
//# sourceMappingURL=browser.js.map