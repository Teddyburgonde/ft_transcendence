"use strict";
/*
    A simple timer that can be conveniently reset or stopped.
    In Node.js, the timer will not prevent the process from exiting.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Timer {
    constructor(duration, callback) {
        this.duration = duration;
        this.callback = callback;
        if (duration === 0)
            return;
        this.timer = setTimeout(callback, duration);
        unref(this.timer);
    }
    reset() {
        clearTimeout(this.timer);
        if (this.duration === 0)
            return;
        this.timer = setTimeout(this.callback, this.duration);
        unref(this.timer);
    }
    stop() {
        clearTimeout(this.timer);
    }
}
exports.default = Timer;
function unref(timer) {
    if (typeof timer?.unref === 'function') {
        timer.unref();
    }
}
//# sourceMappingURL=timer.js.map