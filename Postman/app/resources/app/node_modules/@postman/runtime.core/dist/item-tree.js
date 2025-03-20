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
exports.ItemTreeSchema = exports.ItemNodeSchema = void 0;
const z = __importStar(require("zod"));
const item_1 = require("./item");
/*
    An ItemTree is simply a hierarchical arrangement of Items. It is typically
    used to represent an entire Collection, but it can also be used to represent
    sub-trees within a Collection.
*/
exports.ItemNodeSchema = item_1.ItemSchema.omit({ children: true });
exports.ItemTreeSchema = z.lazy(() => z.object({
    item: exports.ItemNodeSchema,
    children: z.array(exports.ItemTreeSchema),
}));
var ItemTree;
(function (ItemTree) {
    function isItemTree(value) {
        return exports.ItemTreeSchema.safeParse(value).success;
    }
    ItemTree.isItemTree = isItemTree;
    function fromItems(items) {
        const subtrees = new Map();
        const unreferenced = new Set();
        // Clone the items, and treat them as plain JSON.
        items = JSON.parse(JSON.stringify(items));
        // Strip each item's "children" property, and create empty subtrees.
        for (const item of items) {
            const { children: _, ...treeItem } = item;
            if (subtrees.has(item.id)) {
                throw new Error(`Duplicate item "${item.id}"`);
            }
            subtrees.set(item.id, { item: treeItem, children: [] });
            unreferenced.add(item.id);
        }
        // Populate the children of each subtree.
        for (const item of items) {
            const subtree = subtrees.get(item.id);
            for (const childReference of item.children) {
                const child = subtrees.get(childReference.id);
                if (!child) {
                    throw new Error(`Missing child item "${childReference.id}"`);
                }
                if (!unreferenced.has(childReference.id)) {
                    throw new Error(`Multiple references to child item "${childReference.id}"`);
                }
                subtree.children.push(child);
                unreferenced.delete(childReference.id);
            }
        }
        // Determine the root item.
        if (!unreferenced.size) {
            throw new Error('Missing root item');
        }
        if (unreferenced.size > 1) {
            throw new Error('Multiples root items');
        }
        return subtrees.get(unreferenced.values().next().value);
    }
    ItemTree.fromItems = fromItems;
    function toItems(tree) {
        const items = [];
        // Clone the items, and treat them as plain JSON.
        tree = JSON.parse(JSON.stringify(tree));
        // Recursively unwrap each subtree.
        (function walk(subtree) {
            items.push({
                ...subtree.item,
                payload: subtree.item.payload,
                children: subtree.children.map((child) => ({
                    id: child.item.id,
                    type: child.item.type,
                })),
            });
            subtree.children.forEach(walk);
        })(tree);
        return items;
    }
    ItemTree.toItems = toItems;
    function toResolved(tree) {
        // Clone the items, and treat them as plain JSON.
        tree = JSON.parse(JSON.stringify(tree));
        // Recursively pass inherited Extensions down the tree.
        (function walk(subtree, auth, events) {
            const extensions = subtree.item.extensions;
            if (extensions.auth != null && extensions.auth.type !== 'noauth') {
                auth = extensions.auth;
            }
            if (extensions.events != null && extensions.events.length > 0) {
                if (events != null && events.length > 0) {
                    events = events.concat(extensions.events);
                }
                else {
                    events = extensions.events;
                }
            }
            if (auth !== extensions.auth && auth !== undefined) {
                extensions.auth = JSON.parse(JSON.stringify(auth));
            }
            if (events !== extensions.events && events !== undefined) {
                extensions.events = JSON.parse(JSON.stringify(events));
            }
            for (const child of subtree.children) {
                walk(child, auth, events);
            }
        })(tree, undefined, undefined);
        return tree;
    }
    ItemTree.toResolved = toResolved;
})(ItemTree || (ItemTree = {}));
exports.default = ItemTree;
//# sourceMappingURL=item-tree.js.map