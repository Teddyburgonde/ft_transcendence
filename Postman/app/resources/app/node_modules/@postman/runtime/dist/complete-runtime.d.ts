import { Item, ItemType, ItemTree, Run, Runtime, RuntimeOptions } from '@postman/runtime.core';
export default class CompleteRuntime extends Runtime {
    execItem<Y extends ItemType = ItemType>(item: Item.OfType<Y>, options?: CompleteRuntimeOptions): Run;
    execTree(tree: ItemTree, options?: CompleteRuntimeOptions): Run;
}
export interface CompleteRuntimeOptions extends RuntimeOptions {
    /**
     * If true, the runtime will stop execution on seeing the
     * first error from the item's or extension's execution and
     * no further events will be emitted.
     */
    stopOnError?: boolean;
}
