"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
// TODO: this JSON schema is not currently being used at runtime
const definition = (0, json_schema_to_ts_1.asConst)({
    'sent-request-header': {
        schema: {
            type: 'object',
            required: ['metadata', 'isRequestStreamed', 'isResponseStreamed'],
            properties: {
                metadata: {
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
                        },
                        additionalProperties: false,
                    },
                },
                isRequestStreamed: {
                    type: 'boolean',
                },
                isResponseStreamed: {
                    type: 'boolean',
                },
            },
            additionalProperties: false,
        },
    },
    'received-response-header': {
        schema: {
            type: 'object',
            required: ['metadata'],
            properties: {
                metadata: {
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
                        },
                        additionalProperties: false,
                    },
                },
            },
            additionalProperties: false,
        },
    },
    'sent-request-data': {
        schema: {
            type: 'object',
            required: ['data'],
            properties: {
                data: {
                    type: 'object',
                },
            },
            additionalProperties: false,
        },
    },
    'received-response-data': {
        schema: {
            type: 'object',
            required: ['data'],
            properties: {
                data: {
                    type: 'object',
                },
            },
            additionalProperties: false,
        },
    },
    status: {
        schema: {
            type: 'object',
            required: ['statusCode', 'statusMessage', 'metadata'],
            properties: {
                statusCode: {
                    type: 'integer',
                    minimum: 0,
                },
                statusMessage: {
                    type: 'string',
                },
                metadata: {
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
                        },
                        additionalProperties: false,
                    },
                },
                timings: {
                    type: 'object',
                    required: ['total'],
                    properties: {
                        total: {
                            type: 'number',
                            minimum: 0,
                        },
                    },
                    additionalProperties: false,
                },
            },
            additionalProperties: false,
        },
    },
    'internal:error': {
        schema: {
            type: 'object',
            required: ['message'],
            properties: {
                message: {
                    type: 'string',
                },
            },
        },
    },
    'internal:transient-error': {
        schema: {
            type: 'object',
            required: ['message'],
            properties: {
                message: {
                    type: 'string',
                },
            },
        },
    },
});
//# sourceMappingURL=events.js.map