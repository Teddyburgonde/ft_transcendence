"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const item_1 = __importDefault(require("./item"));
const constraint_1 = __importDefault(require("./constraint"));
/*
    A Validator is a container for all your known ItemTypes. After registering
    all your ItemTypes, you can use the Validator to validate Items. Unknown
    ItemTypes and Extensions are ignored (i.e., they always pass validation),
    which is the desired behavior for most clients. However, in rare cases you
    may instead use strict validation to reject unknown ItemTypes and
    Extensions.
*/
class Validator {
    constructor() {
        this.itemTypes = new Map();
    }
    registerType(itemType) {
        if (this.itemTypes.has(itemType.name)) {
            throw new TypeError(`ItemType "${itemType.name}" already exists`);
        }
        this.itemTypes.set(itemType.name, itemType);
        return this;
    }
    getType(name) {
        return this.itemTypes.get(name);
    }
    eachType() {
        return this.itemTypes.values();
    }
    // Asserts that the given value is a valid item.
    validateItem(item) {
        if (!item_1.default.isItem(item)) {
            throw new Error('Invalid Item');
        }
        const itemType = this.itemTypes.get(item.type);
        if (itemType) {
            for (const constraint of itemType.constraints) {
                if (!constraint_1.default.isOk(item, constraint)) {
                    throw new Error(`Item violates constraint "${constraint.constraint}"`);
                }
            }
            if (!itemType.isValidPayload(item.payload)) {
                throw new Error(`Item violates the schema for ItemType "${itemType.name}"`);
            }
            for (const [extName, extData] of Object.entries(item.extensions)) {
                const impl = itemType.extensions.find((x) => x.extension.name === extName);
                if (impl && !impl.extension.isValid(extData)) {
                    throw new Error(`Item violates the schema for extension "${extName}"`);
                }
            }
        }
    }
    // Asserts that the given value is a valid item, and that its item type and
    // extensions are all known by this Validator.
    validateItemStrict(item) {
        this.validateItem(item);
        const itemType = this.itemTypes.get(item.type);
        if (!itemType) {
            throw new Error(`Unrecognized ItemType "${item.type}"`);
        }
        for (const extName of Object.keys(item.extensions)) {
            if (!itemType.extensions.find((x) => x.extension.name === extName)) {
                throw new Error(`Unrecognized extension "${extName}"`);
            }
        }
    }
    // Returns whether the given item's type is registered in this Validator.
    isKnownItem(item) {
        return this.itemTypes.has(item.type);
    }
    // Returns whether the given item's type, as well as all of its extensions,
    // are registered in this Validator.
    isCompletelyKnownItem(item) {
        const itemType = this.itemTypes.get(item.type);
        if (!itemType) {
            return false;
        }
        for (const extName of Object.keys(item.extensions)) {
            if (!itemType.extensions.find((x) => x.extension.name === extName)) {
                return false;
            }
        }
        return true;
    }
}
exports.Validator = Validator;
//# sourceMappingURL=validator.js.map