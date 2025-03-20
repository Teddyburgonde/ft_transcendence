"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
const runtime_core_1 = require("@postman/runtime.core");
const runtime_documentation_1 = __importDefault(require("@postman/runtime.documentation"));
const definition = (0, json_schema_to_ts_1.asConst)({
    name: 'collection',
    summary: 'Save your requests in a collection for reuse and sharing',
    schema: {
        type: 'object',
        properties: {
            variables: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['key', 'value'],
                    properties: {
                        key: {
                            type: 'string',
                        },
                        value: {
                            type: 'string',
                        },
                        disabled: {
                            type: 'boolean',
                        },
                    },
                    additionalProperties: false,
                },
            },
        },
        additionalProperties: false,
    },
    constraints: [
        {
            constraint: 'allow-child-types',
            allowed: [
                'folder',
                'ws-raw-request',
                'ws-socketio-request',
                'grpc-request',
                'graphql-request',
            ],
        },
        {
            constraint: 'allow-extensions',
            allowed: ['documentation'],
        },
        {
            constraint: 'require-extensions',
            required: ['documentation'],
        },
    ],
});
const extensions = [runtime_documentation_1.default.use().implement({})];
var Collection;
(function (Collection) {
    Collection.use = runtime_core_1.ItemType.define(definition, extensions);
})(Collection || (Collection = {}));
exports.default = Collection;
//# sourceMappingURL=index.js.map