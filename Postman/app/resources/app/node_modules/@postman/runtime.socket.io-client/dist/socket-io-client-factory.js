"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOClientFactory = void 0;
// @ts-ignore Ignore the error caused due to absent type defs for socket.io-client-v2
const socket_io_client_v2_1 = __importDefault(require("socket.io-client-v2"));
const socket_io_client_v4_1 = require("socket.io-client-v4");
class SocketIOClientFactory {
    static getClient(version) {
        if (version === '2') {
            return socket_io_client_v2_1.default;
        }
        return socket_io_client_v4_1.io;
    }
}
exports.SocketIOClientFactory = SocketIOClientFactory;
//# sourceMappingURL=socket-io-client-factory.js.map