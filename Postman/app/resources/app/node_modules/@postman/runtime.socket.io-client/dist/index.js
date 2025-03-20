"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = void 0;
const connection_1 = require("./connection");
function connect(options) {
    return new connection_1.Connection(options);
}
exports.connect = connect;
//# sourceMappingURL=index.js.map