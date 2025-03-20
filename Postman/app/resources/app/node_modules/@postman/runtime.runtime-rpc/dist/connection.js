"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const runtime_core_1 = require("@postman/runtime.core");
const uuid_1 = require("uuid");
class Connection extends runtime_core_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.id = (0, uuid_1.v4)();
    }
    close() { }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map