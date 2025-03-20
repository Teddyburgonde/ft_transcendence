import * as z from 'zod';
import LoneItem from './item';
export declare const ItemNodeSchema: z.ZodObject<Omit<{
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
}, "children">, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    title: string;
    createdAt: string;
    extensions: Record<string, unknown>;
    payload?: unknown;
}, {
    type: string;
    id: string;
    title: string;
    createdAt: string;
    extensions: Record<string, unknown>;
    payload?: unknown;
}>;
type ItemNode = z.infer<typeof ItemNodeSchema>;
interface ItemTree {
    item: ItemNode;
    children: ItemTree[];
}
export declare const ItemTreeSchema: z.ZodSchema<ItemTree>;
declare namespace ItemTree {
    function isItemTree(value: unknown): value is ItemTree;
    function fromItems(items: ReadonlyArray<LoneItem>): ItemTree;
    function toItems(tree: ItemTree): LoneItem[];
    function toResolved(tree: ItemTree): ItemTree;
    type Item = ItemNode;
}
export default ItemTree;
