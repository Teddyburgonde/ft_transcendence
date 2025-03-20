"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_core_1 = require("@postman/runtime.core");
/*
    CompleteRuntime is a subclass of Runtime that implements higher-level
    functionality compared to the core Runtime. While the core Runtime only
    provides fundamental behaviors via a minimal API, CompleteRuntime is
    designed to expose all potentially desirable behaviors as plug-and-play
    options. It is inspired by the giant "options" object accepted by the
    "postman-runtime": <https://github.com/postmanlabs/postman-runtime#options>.
*/
class CompleteRuntime extends runtime_core_1.Runtime {
    execItem(item, options) {
        const run = super.execItem(item, options);
        cancelOnError(run, options?.stopOnError);
        return run;
    }
    execTree(tree, options) {
        const run = super.execTree(tree, options);
        cancelOnError(run, options?.stopOnError);
        return run;
    }
}
exports.default = CompleteRuntime;
function cancelOnError(run, stopOnError) {
    if (!stopOnError)
        return;
    run.events.onAll((event) => {
        if (event.payload?.[runtime_core_1.STOP_RUN]) {
            // Cancel run in the next tick to allow
            // the queued event handlers to finish.
            Promise.resolve().then(() => run.cancel());
        }
    });
}
//# sourceMappingURL=complete-runtime.js.map