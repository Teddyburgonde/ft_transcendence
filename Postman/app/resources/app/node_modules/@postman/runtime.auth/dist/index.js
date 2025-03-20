"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
const runtime_core_1 = require("@postman/runtime.core");
const handler_1 = __importDefault(require("./handler"));
const definition = (0, json_schema_to_ts_1.asConst)({
    name: 'auth',
    summary: 'Security credentials',
    schema: {
        type: 'object',
        required: ['type'],
        properties: {
            type: {
                type: 'string',
                enum: [
                    'noauth',
                    'awsv4',
                    'basic',
                    'bearer',
                    'hawk',
                    'oauth1',
                    'oauth2',
                    'apikey',
                    'edgegrid',
                ],
            },
            awsv4: {
                $ref: '#/definitions/key-value-pairs',
            },
            basic: {
                $ref: '#/definitions/key-value-pairs',
            },
            bearer: {
                $ref: '#/definitions/key-value-pairs',
            },
            hawk: {
                $ref: '#/definitions/key-value-pairs',
            },
            oauth1: {
                $ref: '#/definitions/key-value-pairs',
            },
            oauth2: {
                $ref: '#/definitions/key-value-pairs',
            },
            apikey: {
                $ref: '#/definitions/key-value-pairs',
            },
            edgegrid: {
                $ref: '#/definitions/key-value-pairs',
            },
        },
        additionalProperties: false,
        definitions: {
            'key-value-pairs': {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['key', 'value'],
                    properties: {
                        key: {
                            type: 'string',
                        },
                        value: {},
                    },
                    additionalProperties: false,
                },
            },
        },
    },
});
var Auth;
(function (Auth) {
    Auth.use = runtime_core_1.Extension.define(definition, handler_1.default);
})(Auth || (Auth = {}));
exports.default = Auth;
//# sourceMappingURL=index.js.map