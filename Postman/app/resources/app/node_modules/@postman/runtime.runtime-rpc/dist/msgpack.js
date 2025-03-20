"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tiny_msgpack_1 = require("tiny-msgpack");
const codec = new tiny_msgpack_1.Codec().register(1, Error, encodeError, decodeError);
function encodeError(err) {
    return (0, tiny_msgpack_1.encode)(Object.assign({ message: err.message }, err), codec);
}
function decodeError(buffer) {
    const format = buffer[0];
    if ((format & 0xf0) !== 0x80 && format !== 0xde && format !== 0xdf) {
        throw new Error('Invalid Error type received (not a Map)');
    }
    const obj = (0, tiny_msgpack_1.decode)(buffer, codec);
    if (obj.message === undefined) {
        throw new Error('Invalid Error type received (no "message" key)');
    }
    if (typeof obj.message !== 'string') {
        throw new Error('Invalid Error type received (non-string "message")');
    }
    return Object.assign(new Error(obj.message), obj);
}
exports.default = {
    encode(data) {
        return (0, tiny_msgpack_1.encode)(data, codec);
    },
    decode(buffer) {
        return (0, tiny_msgpack_1.decode)(buffer, codec);
    },
};
//# sourceMappingURL=msgpack.js.map