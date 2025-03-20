"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
const runtime_core_1 = require("@postman/runtime.core");
const definition = (0, json_schema_to_ts_1.asConst)({
    name: 'documentation',
    summary: 'Document your items',
    schema: {
        type: 'object',
        required: ['content'],
        properties: {
            content: {
                type: 'string',
            },
            summary: {
                type: 'string',
                maxLength: 140,
            },
        },
        additionalProperties: false,
    },
});
var Documentation;
(function (Documentation) {
    Documentation.use = runtime_core_1.Extension.define(definition);
})(Documentation || (Documentation = {}));
exports.default = Documentation;
//# sourceMappingURL=index.js.map