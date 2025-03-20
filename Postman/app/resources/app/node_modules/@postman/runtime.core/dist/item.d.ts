import * as z from 'zod';
import ItemType from './item-type';
import Extension from './extension';
import { GetExtensionData, GetTypeData, GetTypeExtensions } from './types';
export declare const ItemSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    createdAt: z.ZodString;
    children: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
    }, {
        type: string;
        id: string;
    }>, "many">;
    payload: z.ZodUnknown;
    extensions: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    title: string;
    createdAt: string;
    children: {
        type: string;
        id: string;
    }[];
    extensions: Record<string, unknown>;
    payload?: unknown;
}, {
    type: string;
    id: string;
    title: string;
    createdAt: string;
    children: {
        type: string;
        id: string;
    }[];
    extensions: Record<string, unknown>;
    payload?: unknown;
}>;
declare namespace Item {
    function isItem(value: unknown): value is Item;
    type WithExtension<E extends Extension> = Item<unknown, E>;
    type WithPayload<Y extends ItemType> = Item<GetTypeData<Y>>;
    type OfType<Y extends ItemType> = Item<GetTypeData<Y>, GetTypeExtensions<Y>>;
}
type Item<T = unknown, E extends Extension = never> = z.infer<typeof ItemSchema> & {
    payload: T;
    extensions: {
        [X in E as X['name']]?: GetExtensionData<X>;
    };
};
export default Item;
