"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
const runtime_core_1 = require("@postman/runtime.core");
const handler_1 = __importDefault(require("./handler"));
const definition = (0, json_schema_to_ts_1.asConst)({
    name: 'events',
    summary: 'Script hooks for collection execution',
    schema: {
        type: 'array',
        items: {
            type: 'object',
            required: ['listen'],
            properties: {
                listen: {
                    type: 'string',
                },
                script: {
                    type: 'object',
                    required: ['exec'],
                    properties: {
                        exec: {
                            type: 'string',
                        },
                        type: {
                            type: 'string',
                            enum: ['text/javascript'],
                        },
                    },
                    additionalProperties: false,
                },
            },
            additionalProperties: false,
        },
    },
});
var Events;
(function (Events) {
    Events.use = runtime_core_1.Extension.define(definition, handler_1.default);
})(Events || (Events = {}));
exports.default = Events;
//# sourceMappingURL=index.js.map