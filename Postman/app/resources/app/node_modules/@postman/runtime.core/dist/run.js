"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.impls = void 0;
const runtime_event_channel_1 = require("@postman/runtime.event-channel");
const create_async_iterator_1 = __importDefault(require("./create-async-iterator"));
const extension_1 = require("./extension");
const item_type_1 = require("./item-type");
exports.impls = Symbol();
class Run {
    constructor(runtime, context, queue, startPaused) {
        this.runtime = runtime;
        this.queue = queue;
        this.events = new runtime_event_channel_1.EventChannel();
        this.currentTask = null;
        this.currentPosition = 0;
        this.isPaused = true;
        // Making event channel behave like an EventEmitter
        this.events.link(this.events);
        this.context = { ...context, events: this.events };
        if (!startPaused) {
            this.resume();
        }
    }
    async execItem(item) {
        const { context, events } = this;
        const onEventHandlers = [];
        try {
            // TODO: validate item against Runtime/Validator
            const impl = this.runtime[exports.impls].get(item.type);
            if (!impl) {
                return;
            }
            const { itemType } = impl;
            const mainHandler = itemType[item_type_1.itemHandler];
            if (typeof mainHandler !== 'function') {
                return;
            }
            await null; // Give consumers a chance to attach event listeners
            await events.emitSelf('internal:exec-begin', { item });
            const allHooks = [];
            for (const { extension } of itemType.extensions) {
                const handler = extension[extension_1.extensionHandler];
                if (typeof handler === 'function') {
                    const hooks = await handler(itemType, context);
                    if (events.closed)
                        return;
                    if (hooks != null) {
                        allHooks.push(hooks);
                    }
                }
            }
            // Attach event listeners to fire onEvent hooks. This needs to be
            // done before onBefore hooks are executed so that the any events
            // emitted during onBefore are also captured.
            for (const hooks of allHooks) {
                const onEvent = hooks?.onEvent;
                if (typeof onEvent === 'function') {
                    events.onAll(onEvent);
                    onEventHandlers.push(onEvent);
                }
            }
            for (const hooks of allHooks) {
                const onBefore = hooks?.onBefore;
                if (typeof onBefore === 'function') {
                    const newItem = await onBefore(item);
                    // TODO: allow the item execution to be skipped within onBefore hook
                    if (events.closed) {
                        // If the run was cancelled during the hook, just return.
                        return;
                    }
                    if (newItem != null) {
                        item = newItem;
                    }
                }
            }
            await mainHandler(item, impl.config, context);
            if (events.closed) {
                // If the run was cancelled during execution, just return.
                return;
            }
            for (const hooks of allHooks) {
                const onAfter = hooks?.onAfter;
                if (typeof onAfter === 'function') {
                    await onAfter();
                    if (events.closed) {
                        // If the run was cancelled during the hook, just return.
                        return;
                    }
                }
            }
            onEventHandlers.forEach((handler) => events.offAll(handler));
            await events.emitSelf('internal:exec-end', {});
        }
        catch (err) {
            await events.emitSelf('internal:error', err);
            events.close();
        }
    }
    // Unpauses the run, and starts executing the next task if there is no
    // current task. If there are no more tasks, the run is ended.
    resume() {
        this.isPaused = false;
        if (!this.currentTask && !this.events.closed) {
            const item = this.queue[this.currentPosition];
            if (item) {
                this.currentTask = this.execItem(item).then(() => {
                    this.currentTask = null;
                    this.currentPosition += 1;
                    this.isPaused || this.resume();
                });
            }
            else {
                this.events.close();
            }
        }
    }
    // Schedules the run to pause when the current task is finished. The
    // returned promise is fulfilled when the current task is finished.
    pause() {
        this.isPaused = true;
        if (this.currentTask) {
            return this.currentTask.then();
        }
        else {
            return Promise.resolve();
        }
    }
    // Cancels the run. Any futher events are ignored, and nothing more will be
    // executed after the current task is finished.
    cancel() {
        this.events.close();
    }
    get done() {
        return this.events.closed;
    }
    get paused() {
        return this.isPaused && !this.currentTask;
    }
    get waitingToPause() {
        return this.isPaused && !!this.currentTask;
    }
    [Symbol.asyncIterator]() {
        const iterator = (0, create_async_iterator_1.default)((write) => {
            return new Promise((resolve, reject) => {
                this.events.onAll(write);
                this.events.on('internal:error', (event) => reject(event.payload));
                this.events.onCleanup(() => resolve());
            });
        });
        return {
            next: async () => {
                return iterator.next();
            },
            throw: async (error) => {
                this.cancel();
                return iterator.throw(error);
            },
            return: async () => {
                this.cancel();
                return iterator.return();
            },
        };
    }
}
exports.default = Run;
//# sourceMappingURL=run.js.map