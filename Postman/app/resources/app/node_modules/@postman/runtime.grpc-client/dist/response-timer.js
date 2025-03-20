"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_perf_hooks_1 = require("node:perf_hooks");
class ResponseTimer {
    begin() {
        this.startTime = node_perf_hooks_1.performance.now();
    }
    end() {
        this.endTime = node_perf_hooks_1.performance.now();
    }
    resolve() {
        if (this.startTime === undefined) {
            throw new Error('Timer has not been started');
        }
        if (this.endTime === undefined) {
            this.end();
        }
        const total = this.endTime - this.startTime;
        this.startTime = undefined;
        this.startTime = undefined;
        return total;
    }
}
exports.default = ResponseTimer;
//# sourceMappingURL=response-timer.js.map