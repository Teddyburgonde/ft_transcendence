"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const events_1 = require("events");
const postman_ws_1 = __importDefault(require("postman-ws"));
const utils_1 = require("./utils");
class Connection extends events_1.EventEmitter {
    constructor(connectionOptions) {
        super();
        this.reconnectCount = -1;
        this.isConnectionAborted = false;
        this.connectionOptions = connectionOptions;
        try {
            this.open();
        }
        catch (e) {
            const error = e;
            this.emit('error', { error: { message: error.message } });
            this.emit('end', { aborted: this.isConnectionAborted });
            return;
        }
    }
    open() {
        const options = {
            headers: this.connectionOptions.headers,
            maxPayload: this.connectionOptions.connectOptions?.maxPayload,
            handshakeTimeout: this.connectionOptions?.connectOptions?.handshakeTimeout,
            followRedirects: this.connectionOptions.connectOptions?.followRedirects,
            rejectUnauthorized: this.connectionOptions?.tlsOptions?.rejectUnauthorized,
            ...this.connectionOptions?.tlsOptions?.secureContext,
        };
        const url = typeof this.connectionOptions.url === 'string' ?
            this.connectionOptions.url
            : this.connectionOptions.url.href;
        if (!(0, utils_1.isValidUrl)(url)) {
            throw new Error('Invalid URL');
        }
        this.client = new postman_ws_1.default(url, this.connectionOptions.protocols, options);
        this.client
            .on('upgrade', () => {
            if (!this.client._debug) {
                this.emit('upgrade', {});
                return;
            }
            const { request, response } = this.extractRequestResponseFromClient();
            this.emit('upgrade', { request, response });
            return;
        })
            .on('open', () => {
            this.reconnectCount = 0;
            const { request, response } = this.extractRequestResponseFromClient(true);
            this.emit('open', { request, response });
        })
            .on('close', (code, reason) => {
            if (this.reconnectCount === 0) {
                this.emit('close', { code, reason });
            }
            if (code == 1000 ||
                this.isConnectionAborted ||
                this.reconnectCount === -1) {
                this.emit('end', { code, reason, aborted: this.isConnectionAborted });
                return;
            }
            this.reconnect(code, reason);
        })
            .on('message', (message) => {
            if (typeof message === 'string') {
                this.emit('message', { message });
                return;
            }
            // If message is an array of buffers, combine them into a single buffer
            if (Array.isArray(message) && message.every(Buffer.isBuffer)) {
                message = Buffer.concat(message);
            }
            if (Buffer.isBuffer(message)) {
                message = message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength);
                message = new Uint8Array(message);
            }
            this.emit('message', { message: new Uint8Array(message) });
        })
            .on('error', (error) => {
            // If connection was aborted, absorb the error
            if (this.isConnectionAborted) {
                return;
            }
            // Emit error only for the final reconnect attempt
            if (this.reconnectCount > 0 &&
                this.reconnectCount <
                    (this.connectionOptions?.reconnectOptions?.retryCount ?? 0)) {
                return;
            }
            const { request, response } = this.extractRequestResponseFromClient(true);
            this.emit('error', {
                error: { message: error.message },
                handshakeRequest: request,
                handshakeResponse: response,
            });
            return;
        });
    }
    send(message) {
        this.client.send(message);
    }
    extractRequestResponseFromClient(clearDebug = false) {
        if (!this.client._debug?.length) {
            return {};
        }
        const request = this.client._debug[0].request;
        const response = this.client._debug[this.client._debug.length - 1].response;
        if (clearDebug) {
            this.client._debug = [];
        }
        return { request, response };
    }
    reconnect(code, reason) {
        this.client.removeAllListeners();
        if (this.reconnectCount >=
            (this.connectionOptions?.reconnectOptions?.retryCount ?? 0)) {
            this.emit('end', { code, reason, aborted: this.isConnectionAborted });
            // If we have reached the maximum number of retries, don't reconnect;
            return;
        }
        setTimeout(() => {
            this.open();
        }, this.connectionOptions?.reconnectOptions?.retryDelay ?? 0);
        this.emit('reconnect', {
            attempt: ++this.reconnectCount,
            timeout: this.connectionOptions?.reconnectOptions?.retryDelay ?? 0,
        });
    }
    close(code = 1000, reason = '') {
        // Defaulting to 1000 (Normal Closure) and reason to empty string since
        // `postman-ws` tries to build an incorrect close frame and errors out
        // if nothing is passed.
        // Mark connection as aborted if it's closed in non-open state
        // Refer: https://github.com/websockets/ws/blob/7.4.4/lib/websocket.js#L26
        if (this.client.readyState !== 1) {
            this.isConnectionAborted = true;
        }
        this.client.close(code, reason);
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map