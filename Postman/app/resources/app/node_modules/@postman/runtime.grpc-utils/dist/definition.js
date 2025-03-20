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
exports.Type = exports.Method = exports.Definition = void 0;
const ajv_1 = __importDefault(require("ajv"));
const Protobuf = __importStar(require("@postman/protobufjs"));
const descriptors_1 = require("./descriptors");
const generate_json_schema_1 = __importDefault(require("./generate-json-schema"));
// A Definition represents a parsed Protobuf descriptor, and contains
// information about all methods defined within the descriptor.
class Definition {
    constructor(descriptor) {
        const jsonDescriptor = (0, descriptors_1.toJSONDescriptor)(descriptor);
        const root = Protobuf.Root.fromJSON(jsonDescriptor).resolveAll();
        const methods = new Map();
        (function walk(node) {
            if (node instanceof Protobuf.Service) {
                for (const methodNode of node.methodsArray) {
                    const method = new Method(methodNode);
                    methods.set(method.name, method);
                }
            }
            else if (node instanceof Protobuf.Namespace) {
                node.nestedArray.forEach(walk);
            }
        })(root);
        this.methods = methods;
    }
}
exports.Definition = Definition;
class Method {
    constructor(node) {
        if (!node.resolvedRequestType || !node.resolvedResponseType) {
            throw new TypeError('The given AST node must be fully resolved');
        }
        this.name = node.fullName.replace(/^\./, '');
        this.comment = node.comment;
        this.kind =
            node.requestStream ?
                node.responseStream ?
                    'bidi'
                    : 'client-stream'
                : node.responseStream ? 'server-stream'
                    : 'unary';
        this.requestType = new Type(node.resolvedRequestType);
        this.responseType = new Type(node.resolvedResponseType);
    }
}
exports.Method = Method;
class Type {
    constructor(node) {
        if (!node.resolved) {
            throw new TypeError('The given AST node must be fully resolved');
        }
        this.name = node.fullName.replace(/^\./, '');
        this.comment = node.comment;
        this.astNode = node;
    }
    get jsonSchema() {
        if (this._jsonSchema === undefined) {
            this._jsonSchema = (0, generate_json_schema_1.default)(this.astNode);
        }
        return this._jsonSchema;
    }
    validate(json) {
        if (typeof json !== 'string') {
            // This provides a better error for non-TypeScript applications.
            throw new TypeError('Expected Protobuf message to be a JSON string');
        }
        const validate = new ajv_1.default({ strict: false }).compile(this.jsonSchema);
        try {
            return validate(JSON.parse(json));
        }
        catch (_) {
            return false;
        }
    }
}
exports.Type = Type;
//# sourceMappingURL=definition.js.map