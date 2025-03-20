"use strict";
/*
    Starts a new heartbeat. The callback will be invoked at regular intervals
    with `false` passed as the only argument, until the number of consecutive
    calls exceeds the `tries` argument, at which point the callback will be
    invoked one last time with `true` passed as the argument, which indicates a
    heartbeat failure.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Heartbeat {
    constructor(interval, tries, callback) {
        this.countdown = 0;
        if (interval === 0)
            return;
        this.timer = setInterval(() => {
            if (++this.countdown > tries) {
                clearInterval(this.timer);
                callback(true);
            }
            else {
                callback(false);
            }
        }, interval);
    }
    // Invoke this when activity occurs to reset the heartbeat.
    reset() {
        this.countdown = 0;
    }
    // Abort the heartbeat and clean up.
    stop() {
        clearInterval(this.timer);
    }
}
exports.default = Heartbeat;
//# sourceMappingURL=heartbeat.js.map