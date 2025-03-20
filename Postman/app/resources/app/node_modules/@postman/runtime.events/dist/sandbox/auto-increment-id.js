"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AutoIncrementID {
    constructor() {
        this.nextID = 1;
    }
    generateID() {
        const id = this.nextID++;
        return id.toString();
    }
}
exports.default = AutoIncrementID;
//# sourceMappingURL=auto-increment-id.js.map