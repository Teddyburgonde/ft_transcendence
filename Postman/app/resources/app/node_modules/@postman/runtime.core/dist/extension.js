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
exports.ExtensionDefinition = exports.extensionHandler = void 0;
const z = __importStar(require("zod"));
const JSONSchema = __importStar(require("./json-schema"));
const singleton_1 = __importDefault(require("./singleton"));
const isValid = Symbol();
exports.extensionHandler = Symbol();
/*
    Extensions are used to represent pieces of data or behaviors that are common
    to multiple ItemTypes, typically because they come from some orthogonal
    domain. There are some built-in Extensions which are used internally by
    Postman, but arbitrary Extensions may be defined for arbitrary purposes.

    An Extension's "schema" is a JSON Schema that defines what data (of type D)
    can be stored by the Extension within individual items.

    An Extension's handler allows the Extension to perform arbitrary logic
    while executing an Item. For example, the Extension can modify the Item
    itself, or perform side-effects during execution.

    When an ItemType implements an Extension, it must provide a configuration
    (of type C) which allows the Extension's behavior to be specialized for
    different ItemTypes. This configuration acts as an interface between
    an ItemType (domain-specific) and the Extension (type-agnostic).
*/
exports.ExtensionDefinition = z
    .object({
    name: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    schema: z.unknown(),
})
    .strict();
class Extension {
    constructor(definition, handler = () => { }) {
        // Runtime validation and sanitization.
        definition = exports.ExtensionDefinition.parse(definition);
        this.name = definition.name;
        this.summary = definition.summary;
        this.schema = definition.schema;
        this[isValid] = JSONSchema.compile(definition.schema);
        this[exports.extensionHandler] = handler;
    }
    isValid(value) {
        return this[isValid](value);
    }
}
/*
    When a new extension is defined, we generate a subclass of Extension, which
    has more specific type information and additional methods compared to the
    base class. We call this factory function "SpecificExtension" because it
    makes TypeScript's errors more clear to understand.

    N = the name of the extension, as a string literal type
    D = the type of data defined by the extension's JSON schema
    C = the configuration that must be provided by participating ItemTypes
*/
function SpecificExtension(definition, handler) {
    return (0, singleton_1.default)(class NewExtension extends Extension {
        constructor() {
            super(definition, handler);
            this.name = definition.name;
        }
        isValid(value) {
            return super.isValid(value);
        }
        implement(configuration) {
            return new Extension.Implementation(this, configuration);
        }
    });
}
/*
    Here are various exports that we attach to the Extension class namespace.
*/
(function (Extension) {
    class Implementation {
        constructor(extension, config) {
            this.extension = extension;
            this.config = config;
        }
    }
    Extension.Implementation = Implementation;
    Extension.define = SpecificExtension;
})(Extension || (Extension = {}));
exports.default = Extension;
//# sourceMappingURL=extension.js.map