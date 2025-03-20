"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.RPCMessage = exports.RPCHeartbeat = exports.RPCCancel = exports.RPCResponse = exports.RPCRequest = exports.RPCData = exports.RPCId = void 0;
const zod_1 = require("zod");
const msgpack_1 = __importDefault(require("./msgpack"));
exports.RPCId = zod_1.z.union([zod_1.z.string(), zod_1.z.number()]);
exports.RPCData = zod_1.z.record(zod_1.z.string(), zod_1.z.unknown());
exports.RPCRequest = zod_1.z.object({
    op: zod_1.z.literal('req'),
    id: exports.RPCId,
    method: zod_1.z.string(),
    data: exports.RPCData.optional().nullable(),
    context: exports.RPCData.optional().nullable(),
});
exports.RPCResponse = zod_1.z.object({
    op: zod_1.z.literal('res'),
    id: exports.RPCId,
    data: exports.RPCData.optional().nullable(),
    error: zod_1.z.unknown(),
    context: exports.RPCData.optional().nullable(),
});
exports.RPCCancel = zod_1.z.object({
    op: zod_1.z.literal('cancel'),
    id: exports.RPCId,
    context: exports.RPCData.optional().nullable(),
});
exports.RPCHeartbeat = zod_1.z.object({
    op: zod_1.z.literal('hi'),
    context: exports.RPCData.optional().nullable(),
});
exports.RPCMessage = Object.assign(zod_1.z.discriminatedUnion('op', [exports.RPCRequest, exports.RPCResponse, exports.RPCCancel, exports.RPCHeartbeat]), {
    encode(message) {
        return msgpack_1.default.encode(message);
    },
    decode(data) {
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }
        if (!(data instanceof Uint8Array)) {
            throw new TypeError('Expected ArrayBuffer or Uint8Array');
        }
        const message = msgpack_1.default.decode(data);
        return exports.RPCMessage.parse(message);
    },
});
exports.messages = {
    request(id, method, data) {
        return { op: 'req', id, method, data };
    },
    success(id, data) {
        return { op: 'res', id, data };
    },
    failure(id, error) {
        return { op: 'res', id, error };
    },
    cancel(id) {
        return { op: 'cancel', id };
    },
    heartbeat() {
        return { op: 'hi' };
    },
};
//# sourceMappingURL=message.js.map