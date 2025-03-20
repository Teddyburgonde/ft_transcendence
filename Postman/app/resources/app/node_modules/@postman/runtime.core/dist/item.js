"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSchema = void 0;
const z = __importStar(require("zod"));
/*
    Items are the fundamental nodes that make up a Collection in Postman. Items
    can represent just about anything; each Item has a type, which determines
    what the Item represents (e.g., folders, gRPC requests, etc.). Items can
    have parent-child relationships, making them inherently tree-shaped.

    By default, the exported type `Item` represents a generic item, whose
    payload and extensions are unknown, but its type parameters (T and E) can be
    used to specify its type more precisely:
        T = the type of data within the item's "payload"
        E = a union of all extension types used by this item (or else `never`)

    However, rather than using the type parameters directly, it's recommended to
    use these helpers instead: `WithExtension`, `WithPayload`, `OfType`.

*/
exports.ItemSchema = z.object({
    id: z.string().trim().min(1),
    type: z.string().trim().min(1),
    title: z.string().trim().min(1).max(1024),
    createdAt: z.string().datetime(),
    children: z.array(z.object({
        id: z.string().trim().min(1),
        type: z.string().trim().min(1),
    })),
    payload: z.unknown(),
    extensions: z.record(z.unknown()),
});
var Item;
(function (Item) {
    function isItem(value) {
        return exports.ItemSchema.safeParse(value).success;
    }
    Item.isItem = isItem;
})(Item || (Item = {}));
exports.default = Item;
//# sourceMappingURL=item.js.map