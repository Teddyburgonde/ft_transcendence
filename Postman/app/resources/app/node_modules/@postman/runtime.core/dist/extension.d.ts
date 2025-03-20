import * as z from 'zod';
import { Event } from '@postman/runtime.event-channel';
import { StringLiteral, GetExtensionConfig } from './types';
import { RuntimeContext } from './runtime';
import ItemType from './item-type';
import Item from './item';
declare const isValid: unique symbol;
export declare const extensionHandler: unique symbol;
export declare const ExtensionDefinition: z.ZodObject<{
    name: z.ZodString;
    summary: z.ZodString;
    schema: z.ZodUnknown;
}, "strict", z.ZodTypeAny, {
    name: string;
    summary: string;
    schema?: unknown;
}, {
    name: string;
    summary: string;
    schema?: unknown;
}>;
declare abstract class Extension implements Extension.Definition {
    readonly name: string;
    readonly summary: string;
    readonly schema: unknown;
    readonly [isValid]: (value: unknown) => boolean;
    readonly [extensionHandler]: Extension.Handler;
    protected constructor(definition: Extension.Definition, handler?: Extension.Handler);
    isValid(value: unknown): boolean;
}
declare function SpecificExtension<N extends string = string, D = unknown, C = unknown>(definition: Extension.Definition & {
    name: StringLiteral<N>;
}, handler?: Extension.Handler<Extension.Specific<N, D, C>>): () => Extension.Specific<N, D, C>;
interface SpecificExtension<N extends string, D, C> extends Extension {
    readonly name: N;
    isValid(value: unknown): value is D;
    implement(c: C): Extension.Implementation<Extension.Specific<N, D, C>>;
}
declare namespace Extension {
    type Definition = z.infer<typeof ExtensionDefinition>;
    type Specific<N extends string, D, C> = SpecificExtension<N, D, C>;
    interface Handler<E extends Extension = Extension> {
        (itemType: ItemType.WithExtension<E>, context: RuntimeContext): void | Hooks<Item.WithExtension<E>> | Promise<void | Hooks<Item.WithExtension<E>>>;
    }
    interface Hooks<I extends Item = Item> {
        onBefore?(item: I): void | I | Promise<void | I>;
        onEvent?(event: Event): void;
        onAfter?(): void | Promise<void>;
    }
    class Implementation<E extends Extension = Extension> {
        readonly extension: E;
        readonly config: GetExtensionConfig<E>;
        constructor(extension: E, config: GetExtensionConfig<E>);
    }
    const define: typeof SpecificExtension;
}
export default Extension;
