import * as z from 'zod';
import Item from './item';
import ItemType from './item-type';
export declare const ConstraintSchema: z.ZodDiscriminatedUnion<"constraint", [z.ZodObject<{
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
}>]>;
declare namespace Constraint {
    function isConstraint(value: unknown): value is Constraint;
    function asConstraint(value: unknown): Constraint;
    function isOk(item: Item, constraint: Readonly<Constraint>): boolean;
    function typeIsOk(itemType: ItemType, constraint: Readonly<Constraint>): boolean;
}
type Constraint = z.infer<typeof ConstraintSchema>;
export default Constraint;
