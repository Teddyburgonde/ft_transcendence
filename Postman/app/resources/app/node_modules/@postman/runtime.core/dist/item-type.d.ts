import * as z from 'zod';
import { EventChannel, Event } from '@postman/runtime.event-channel';
import { StringLiteral, SelectExtension, GetTypeConfig } from './types';
import { GetSentEvents, GetReceivedEvents } from './types';
import { RuntimeContext } from './runtime';
import Constraint from './constraint';
import Extension from './extension';
import Item from './item';
declare const isValidPayload: unique symbol;
export declare const itemHandler: unique symbol;
export declare const ItemTypeDefinition: z.ZodObject<{
    name: z.ZodString;
    summary: z.ZodString;
    schema: z.ZodUnknown;
    constraints: z.ZodArray<z.ZodDiscriminatedUnion<"constraint", [z.ZodObject<{
        constraint: z.ZodLiteral<"allow-extensions">;
        allowed: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        constraint: "allow-extensions";
        allowed: string[];
    }, {
        constraint: "allow-extensions";
        allowed: string[];
    }>, z.ZodObject<{
        constraint: z.ZodLiteral<"require-extensions">;
        required: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        constraint: "require-extensions";
        required: string[];
    }, {
        constraint: "require-extensions";
        required: string[];
    }>, z.ZodObject<{
        constraint: z.ZodLiteral<"allow-child-types">;
        allowed: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        constraint: "allow-child-types";
        allowed: string[];
    }, {
        constraint: "allow-child-types";
        allowed: string[];
    }>, z.ZodObject<{
        constraint: z.ZodLiteral<"block-child-types">;
        blocked: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        constraint: "block-child-types";
        blocked: string[];
    }, {
        constraint: "block-child-types";
        blocked: string[];
    }>, z.ZodObject<{
        constraint: z.ZodLiteral<"limit-children">;
        limit: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        constraint: "limit-children";
        limit: number;
    }, {
        constraint: "limit-children";
        limit: number;
    }>, z.ZodObject<{
        constraint: z.ZodLiteral<"limit-children-by-type">;
        limits: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        constraint: "limit-children-by-type";
        limits: Record<string, number>;
    }, {
        constraint: "limit-children-by-type";
        limits: Record<string, number>;
    }>]>, "many">;
}, "strict", z.ZodTypeAny, {
    name: string;
    summary: string;
    constraints: ({
        constraint: "allow-extensions";
        allowed: string[];
    } | {
        constraint: "require-extensions";
        required: string[];
    } | {
        constraint: "allow-child-types";
        allowed: string[];
    } | {
        constraint: "block-child-types";
        blocked: string[];
    } | {
        constraint: "limit-children";
        limit: number;
    } | {
        constraint: "limit-children-by-type";
        limits: Record<string, number>;
    })[];
    schema?: unknown;
}, {
    name: string;
    summary: string;
    constraints: ({
        constraint: "allow-extensions";
        allowed: string[];
    } | {
        constraint: "require-extensions";
        required: string[];
    } | {
        constraint: "allow-child-types";
        allowed: string[];
    } | {
        constraint: "block-child-types";
        blocked: string[];
    } | {
        constraint: "limit-children";
        limit: number;
    } | {
        constraint: "limit-children-by-type";
        limits: Record<string, number>;
    })[];
    schema?: unknown;
}>;
export declare const ExtensionImplementationList: z.ZodArray<z.ZodType<Extension.Implementation<Extension>, z.ZodTypeDef, Extension.Implementation<Extension>>, "many">;
declare abstract class ItemType implements ItemType.Definition {
    readonly name: string;
    readonly summary: string;
    readonly schema: unknown;
    readonly constraints: Array<Constraint>;
    readonly extensions: ReadonlyArray<Extension.Implementation>;
    readonly [isValidPayload]: (value: unknown) => boolean;
    readonly [itemHandler]: ItemType.Handler | undefined;
    protected constructor(definition: ItemType.Definition, extensions?: ReadonlyArray<Extension.Implementation>, handler?: ItemType.Handler);
    isValidPayload(value: unknown): boolean;
}
declare function SpecificItemType<T = unknown, E extends Extension = never, C = unknown, S extends Event = never, R extends Event = never>(definition: ItemType.Definition, extensions?: ReadonlyArray<Extension.Implementation<E>>, handler?: ItemType.Handler<ItemType.Specific<T, E, C, S, R>>): () => ItemType.Specific<T, E, C, S, R>;
interface SpecificItemType<T, E extends Extension, C, S extends Event, R extends Event> extends ItemType {
    isValidPayload(value: unknown): value is T;
    getExtension<N extends E['name']>(name: StringLiteral<N>): Extension.Implementation<SelectExtension<N, E>>;
    implement(c: C): ItemType.Implementation<ItemType.Specific<T, E, C, S, R>>;
}
declare namespace ItemType {
    type Definition = z.infer<typeof ItemTypeDefinition>;
    type Specific<T, E extends Extension, C = unknown, S extends Event = never, R extends Event = never> = SpecificItemType<T, E, C, S, R>;
    type WithExtension<E extends Extension> = Specific<unknown, E, unknown>;
    type InnerChannel<Y extends ItemType> = EventChannel<GetReceivedEvents<Y>, GetSentEvents<Y>>;
    type OuterChannel<Y extends ItemType> = EventChannel<GetSentEvents<Y>, GetReceivedEvents<Y>>;
    interface Handler<Y extends ItemType = ItemType> {
        (item: Item.OfType<Y>, config: GetTypeConfig<Y>, context: RuntimeContext): Promise<void>;
    }
    class Implementation<Y extends ItemType = ItemType> {
        readonly itemType: Y;
        readonly config: GetTypeConfig<Y>;
        constructor(itemType: Y, config: GetTypeConfig<Y>);
    }
    const define: typeof SpecificItemType;
}
export default ItemType;
