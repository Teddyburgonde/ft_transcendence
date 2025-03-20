"use strict";
/*
    A simple class that generates incrementing positive 32-bit unsigned
    integers, wrapping back to 1 when necessary.
*/
Object.defineProperty(exports, "__esModule", { value: true });
class Incrementor {
    constructor() {
        this.nextId = 1;
    }
    next() {
        const id = this.nextId;
        this.nextId = (id + 1) >>> 0 || 1;
        return id;
    }
}
exports.default = Incrementor;
//# sourceMappingURL=incrementor.js.map