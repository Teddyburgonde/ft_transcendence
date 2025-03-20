"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const msgpack_1 = __importDefault(require("./msgpack"));
/*
    This parses a serialized Runtime-RPC message, and ensures it is valid.
*/
function parseMessage(buffer, requests, proxies) {
    // Runtime type-check for non-TypeScript applications.
    if (!(buffer instanceof Uint8Array)) {
        throw new TypeError('Expected message to be a Uint8Array');
    }
    let msg;
    try {
        msg = msgpack_1.default.decode(buffer);
    }
    catch (err) {
        throw new Error(`Received invalid MessagePack: ${err.message}`);
    }
    if (!isValidMessage(msg)) {
        throw new Error('Received invalid Runtime-RPC message');
    }
    if (!isRecognizedMessage(msg)) {
        return null;
    }
    // Ensure there are no duplicate IDs sent to the same session.
    if (msg.op === 'req' || msg.op === 'preq') {
        if (requests.has(msg.id)) {
            throw new Error('Received duplicate request ID');
        }
    }
    else if (msg.op === 'res') {
        if ('data' in msg) {
            const pid = msg.data?.remote;
            if (pid !== undefined) {
                if (!Number.isInteger(pid)) {
                    throw new Error('Received non-integer proxy ID');
                }
                if (proxies.has(pid)) {
                    throw new Error('Received duplicate proxy ID');
                }
            }
        }
    }
    return msg;
}
exports.default = parseMessage;
function isValidMessage(msg) {
    if (!isPlainObject(msg))
        return false;
    if (typeof msg.op !== 'string')
        return false;
    switch (msg.op) {
        case 'req':
            if (!Number.isInteger(msg.id))
                return false;
            if (typeof msg.method !== 'string')
                return false;
            if (!isPlainObject(msg.data))
                return false;
            return true;
        case 'res':
            if (!Number.isInteger(msg.id))
                return false;
            if ('data' in msg) {
                if ('error' in msg)
                    return false;
                if (!isPlainObject(msg.data))
                    return false;
            }
            else {
                if (!('error' in msg))
                    return false;
                if (!(msg.error instanceof Error))
                    return false;
            }
            return true;
        case 'preq':
            if (!Number.isInteger(msg.pid))
                return false;
            if (!Number.isInteger(msg.id))
                return false;
            if (typeof msg.method !== 'string')
                return false;
            if (!Array.isArray(msg.data))
                return false;
            return true;
        case 'pres':
            if (!Number.isInteger(msg.id))
                return false;
            if ('data' in msg) {
                if ('error' in msg)
                    return false;
            }
            else {
                if (!('error' in msg))
                    return false;
                if (!(msg.error instanceof Error))
                    return false;
            }
            return true;
        case 'pevent':
            if (!Number.isInteger(msg.pid))
                return false;
            if (typeof msg.event !== 'string')
                return false;
            if (!Array.isArray(msg.data))
                return false;
            return true;
        case 'pclose':
            if (!Number.isInteger(msg.pid))
                return false;
            if ('error' in msg && !(msg.error instanceof Error))
                return false;
            return true;
        case 'cancel':
            if (!Number.isInteger(msg.id))
                return false;
            return true;
        default:
            return true;
    }
}
function isRecognizedMessage(msg) {
    switch (msg.op) {
        case 'req':
        case 'res':
        case 'preq':
        case 'pres':
        case 'pevent':
        case 'pclose':
        case 'cancel':
        case 'hi':
            return true;
        default:
            return false;
    }
}
const plainObjectProto = Object.getPrototypeOf({});
function isPlainObject(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === plainObjectProto;
}
//# sourceMappingURL=parse-message.js.map