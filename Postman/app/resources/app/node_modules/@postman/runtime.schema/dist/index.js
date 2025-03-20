"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
const runtime_core_1 = require("@postman/runtime.core");
const definition = (0, json_schema_to_ts_1.asConst)({
    name: 'schema',
    summary: 'An associated schema',
    schema: {
        type: 'object',
        oneOf: [
            {
                required: ['source'],
                properties: {
                    source: {
                        type: 'string',
                        const: 'none',
                    },
                },
                additionalProperties: false,
            },
            {
                required: ['source'],
                properties: {
                    source: {
                        type: 'string',
                        const: 'auto',
                    },
                },
                additionalProperties: false,
            },
            {
                required: ['source', 'apiId', 'versionId'],
                properties: {
                    source: {
                        type: 'string',
                        const: 'api',
                    },
                    apiId: {
                        type: 'string',
                    },
                    versionId: {
                        type: 'string',
                    },
                    releaseId: {
                        type: 'string',
                    },
                },
                additionalProperties: false,
            },
        ],
    },
});
var Schema;
(function (Schema) {
    Schema.use = runtime_core_1.Extension.define(definition);
})(Schema || (Schema = {}));
exports.default = Schema;
//# sourceMappingURL=index.js.map