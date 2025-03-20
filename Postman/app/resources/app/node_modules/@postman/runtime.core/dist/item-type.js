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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionImplementationList = exports.ItemTypeDefinition = exports.itemHandler = void 0;
const z = __importStar(require("zod"));
const JSONSchema = __importStar(require("./json-schema"));
const constraint_1 = __importStar(require("./constraint"));
const singleton_1 = __importDefault(require("./singleton"));
const extension_1 = __importDefault(require("./extension"));
const isValidPayload = Symbol();
exports.itemHandler = Symbol();
/*
    ItemTypes classify the various items that make up a Collection in Postman.
    Through ItemTypes, items within a Collection can represent just about
    anything: folders, gRPC requests, example responses, saved messages, etc.

    An ItemType's "schema" is a JSON Schema that defines what data (of type T)
    can be stored within the Item's "payload" field, which represents "private"
    or "domain-specific" data which is only applicable to that specific ItemType
    (in contrast to Extensions). Postman provides many built-in ItemTypes, but
    arbitrary ItemTypes may be defined for arbitrary purposes.

    An ItemType may implement any number of Extensions, which are essentially
    reusable plugins for ItemTypes.

    Users who wish to execute items of a certain ItemType must provide a
    configuration (of type C) which allows the ItemType's behavior to be
    implemented/specialized for the user's environment.

    An ItemType's handler defines what happens when an Item is executed. Not all
    ItemTypes are executable; only executable ItemTypes need a handler. The
    handler must return an EventChannel<S, R>, where S is the union of types
    allowed for sent events (i.e., the events sendable by the user during
    execution), and R is the union of types allowed for received events (i.e.,
    the output of the execution).
*/
exports.ItemTypeDefinition = z
    .object({
    name: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    schema: z.unknown(),
    constraints: z.array(constraint_1.ConstraintSchema),
})
    .strict();
exports.ExtensionImplementationList = z.array(z.instanceof(extension_1.default.Implementation));
class ItemType {
    constructor(definition, extensions = [], handler) {
        // Runtime validation and sanitization.
        definition = exports.ItemTypeDefinition.parse(definition);
        extensions = exports.ExtensionImplementationList.parse(extensions);
        this.name = definition.name;
        this.summary = definition.summary;
        this.schema = definition.schema;
        this.constraints = definition.constraints;
        this.extensions = extensions;
        this[isValidPayload] = JSONSchema.compile(definition.schema);
        this[exports.itemHandler] = handler;
        // Check for duplicate extensions and violated constraints.
        for (let i = 0; i < this.extensions.length; ++i) {
            const extensionName = this.extensions[i].extension.name;
            for (let j = i + 1; j < this.extensions.length; ++j) {
                if (extensionName === this.extensions[j].extension.name) {
                    throw new TypeError(`ItemType "${this.name}" has duplicate extension "${extensionName}"`);
                }
            }
        }
        for (const constraint of this.constraints) {
            if (!constraint_1.default.typeIsOk(this, constraint)) {
                throw new TypeError(`ItemType "${this.name}" violates constraint "${constraint.constraint}"`);
            }
        }
    }
    isValidPayload(value) {
        return this[isValidPayload](value);
    }
}
/*
    When a new ItemType is defined, we generate a subclass of ItemType, which
    has more specific type information and additional methods compared to the
    base class. We call this factory function "SpecificItemType" because it
    makes TypeScript's errors more clear to understand.

    T = the type of data defined by this ItemType's JSON schema
    E = a union of all extension types used by this ItemType (or else `never`)
    C = the configuration that must be provided by users of the ItemType
    S = the union of Event types allowed to be sent by the user during execution
    R = the union of Event types received by the user during execution
*/
function SpecificItemType(definition, extensions, handler) {
    return (0, singleton_1.default)(class NewItemType extends ItemType {
        constructor() {
            super(definition, extensions, handler);
        }
        isValidPayload(value) {
            return super.isValidPayload(value);
        }
        getExtension(name) {
            for (const impl of this.extensions) {
                if (impl.extension.name === name) {
                    return impl;
                }
            }
            throw new TypeError(`Extension "${name}" does not exist on ItemType "${this.name}"`);
        }
        implement(configuration) {
            return new ItemType.Implementation(this, configuration);
        }
    });
}
/*
    Here are various exports that we attach to the ItemType class namespace.
*/
(function (ItemType) {
    class Implementation {
        constructor(itemType, config) {
            this.itemType = itemType;
            this.config = config;
        }
    }
    ItemType.Implementation = Implementation;
    ItemType.define = SpecificItemType;
})(ItemType || (ItemType = {}));
exports.default = ItemType;
//# sourceMappingURL=item-type.js.map