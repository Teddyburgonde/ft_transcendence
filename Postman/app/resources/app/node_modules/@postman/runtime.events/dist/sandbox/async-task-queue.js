"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AsyncQueue {
    constructor() {
        this.queue = [];
        this.running = false;
        this.isKilled = false;
    }
    push(task, callback) {
        if (this.isKilled) {
            throw new Error('Queue is killed. Cannot push new tasks.');
        }
        const wrappedTask = async () => {
            try {
                await task();
                callback();
            }
            catch (e) {
                callback(e);
            }
        };
        this.queue.push(wrappedTask);
        this.run();
    }
    kill() {
        this.queue = [];
        this.running = false;
        this.isKilled = true;
    }
    async drain() {
        const completionTask = async () => { };
        return new Promise((resolve) => {
            this.push(completionTask, resolve);
        });
    }
    async run() {
        if (this.running) {
            return;
        }
        this.running = true;
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            await task();
        }
        this.running = false;
    }
}
exports.default = AsyncQueue;
//# sourceMappingURL=async-task-queue.js.map