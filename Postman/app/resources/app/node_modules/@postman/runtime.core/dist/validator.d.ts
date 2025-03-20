import Item from './item';
import ItemType from './item-type';
export declare class Validator {
    private readonly itemTypes;
    registerType(itemType: ItemType): this;
    getType(name: string): ItemType | undefined;
    eachType(): IterableIterator<ItemType>;
    validateItem(item: unknown): asserts item is Item;
    validateItemStrict(item: unknown): asserts item is Item;
    isKnownItem(item: Item): boolean;
    isCompletelyKnownItem(item: Item): boolean;
}
