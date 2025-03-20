"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sandbox_1 = require("./sandbox");
exports.default = (async function handler(itemType, context) {
    let item;
    let itemContext = {};
    const { config } = itemType.getExtension('events');
    const { supportedListeners, template, setContext } = config;
    const sandbox = await (0, sandbox_1.getSandbox)(context);
    sandbox.register(itemType.name, template);
    async function execute(supportedEvent) {
        const events = item.extensions.events;
        if (!events)
            return;
        const eventsToExecute = events.filter((e) => e.listen === supportedEvent);
        if (!eventsToExecute.length)
            return;
        for (const event of eventsToExecute) {
            await sandbox.execute(itemType.name, event, itemContext);
        }
    }
    return {
        async onBefore(i) {
            // Store the item for other hooks to use
            item = i;
            itemContext = setContext(itemContext, item);
            const supportedEvent = supportedListeners?.onBefore;
            if (!supportedEvent)
                return;
            await execute(supportedEvent);
        },
        onEvent(event) {
            itemContext = setContext(itemContext, item, event);
            const supportedEvent = supportedListeners?.onEvent?.[event.type];
            if (!supportedEvent)
                return;
            execute(supportedEvent);
        },
        async onAfter() {
            // Even though sandbox executes scripts via a queue,
            // explicitly wait for it to complete all `onEvent` scripts
            // as `onAfter` hook might not have any scripts to execute
            // which then would cause the hook to resolve before completion.
            await sandbox.waitForCompletion();
            itemContext = setContext(itemContext, item);
            const supportedEvent = supportedListeners?.onAfter;
            if (!supportedEvent)
                return;
            await execute(supportedEvent);
        },
    };
});
//# sourceMappingURL=handler.js.map