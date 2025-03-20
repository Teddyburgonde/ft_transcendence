"use strict";
/*
    Deferred is a typical exploded Promise, but it automaticlaly gets rejected
    after the specified timeout.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeferrred = void 0;
function createDeferrred(timeout) {
    let resolvePromise;
    let rejectPromise;
    const promise = new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });
    const timer = setTimeout(() => {
        rejectPromise(new Error('Operation timed out'));
    }, timeout);
    return {
        promise,
        resolve() {
            clearTimeout(timer);
            resolvePromise();
        },
        reject(err) {
            clearTimeout(timer);
            rejectPromise(err);
        },
    };
}
exports.createDeferrred = createDeferrred;
//# sourceMappingURL=deferred.js.map