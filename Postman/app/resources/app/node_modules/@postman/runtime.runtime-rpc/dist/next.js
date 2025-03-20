"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.rpc = exports.msgpack = exports.UpdatedConnection = void 0;
var connection_1 = require("./connection");
Object.defineProperty(exports, "UpdatedConnection", { enumerable: true, get: function () { return connection_1.Connection; } });
var msgpack_1 = require("./msgpack");
Object.defineProperty(exports, "msgpack", { enumerable: true, get: function () { return __importDefault(msgpack_1).default; } });
var rpc_1 = require("./rpc");
Object.defineProperty(exports, "rpc", { enumerable: true, get: function () { return rpc_1.rpc; } });
var message_1 = require("./message");
Object.defineProperty(exports, "messages", { enumerable: true, get: function () { return message_1.messages; } });
//# sourceMappingURL=next.js.map