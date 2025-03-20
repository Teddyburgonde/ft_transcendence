"use strict";
/*
    Creates an async iterable iterator from the given initializer function.
    The initializer function is called immediately, with a "write()" function
    passed as its only parameter, which is used to populate the async iterator.
    The initializer function may return a promise, indicating when no more
    output will be generated. Unlike an async generator, this async iterator
    generates output eagerly, buffering output until it is consumed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function createAsyncIterator(initializer) {
    const requests = [];
    let buffer = [];
    let isEnded = false;
    let isDone = false;
    let isError = false;
    let error;
    const onWrite = (value) => {
        if (!isEnded) {
            if (requests.length) {
                requests.shift()({ value, done: false });
            }
            else {
                buffer.push(value);
            }
        }
    };
    const onFinish = () => {
        if (!buffer.length) {
            isDone = true;
            while (requests.length) {
                requests.shift()({ value: undefined, done: true });
            }
        }
    };
    const onCancel = (err) => {
        if (!isDone) {
            buffer = [];
            isEnded = true;
            isDone = true;
            isError = true;
            error = err;
            while (requests.length) {
                requests.shift()(Promise.reject(err));
            }
        }
    };
    new Promise((r) => r(initializer(onWrite))).then(() => {
        if (!isDone) {
            isEnded = true;
            onFinish();
        }
    }, onCancel);
    return {
        next() {
            return new Promise((resolve, reject) => {
                if (!isDone) {
                    if (buffer.length) {
                        resolve({ value: buffer.shift(), done: false });
                        isEnded && onFinish();
                    }
                    else {
                        requests.push(resolve);
                    }
                }
                else if (!isError) {
                    resolve({ value: undefined, done: true });
                }
                else {
                    reject(error);
                }
            });
        },
        return() {
            onCancel(new Error('Operation cancelled'));
            return Promise.resolve({ value: undefined, done: true });
        },
        throw(err) {
            onCancel(err);
            return Promise.reject(err);
        },
        [Symbol.asyncIterator]() {
            return this;
        },
    };
}
exports.default = createAsyncIterator;
//# sourceMappingURL=create-async-iterator.js.map