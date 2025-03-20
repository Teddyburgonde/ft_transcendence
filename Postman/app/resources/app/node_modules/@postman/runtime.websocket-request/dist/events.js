"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
const definition = (0, json_schema_to_ts_1.asConst)({
    connected: {
        schema: {
            type: 'object',
            properties: {
                handshakeRequest: {
                    type: 'object',
                    required: ['method', 'headers', 'url'],
                    properties: {
                        method: {
                            type: 'string',
                            enum: ['GET', 'CONNECT'],
                        },
                        headers: {
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
                        url: {
                            type: 'string',
                        },
                    },
                    additionalProperties: false,
                },
                handshakeResponse: {
                    type: 'object',
                    required: ['statusCode', 'statusMessage', 'headers'],
                    properties: {
                        statusCode: {
                            type: 'integer',
                            minimum: 100,
                            maximum: 599,
                        },
                        statusMessage: {
                            type: 'string',
                        },
                        headers: {
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
            additionalProperties: false,
        },
    },
    disconnected: {
        schema: {
            type: 'object',
            properties: {
                code: {
                    type: 'integer',
                    minimum: 1000,
                    maximum: 4999,
                },
                reason: {
                    type: 'string',
                },
            },
            additionalProperties: false,
        },
    },
    error: {
        schema: {
            type: 'object',
            required: ['error'],
            properties: {
                error: {
                    type: 'object',
                    required: ['message'],
                    properties: {
                        message: {
                            type: 'string',
                        },
                    },
                    additionalProperties: false,
                },
                handshakeRequest: {
                    type: 'object',
                    required: ['method', 'headers', 'url'],
                    properties: {
                        method: {
                            type: 'string',
                            enum: ['GET', 'CONNECT'],
                        },
                        headers: {
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
                        url: {
                            type: 'string',
                        },
                    },
                    additionalProperties: false,
                },
                handshakeResponse: {
                    type: 'object',
                    required: ['statusCode', 'statusMessage', 'headers'],
                    properties: {
                        statusCode: {
                            type: 'integer',
                            minimum: 100,
                            maximum: 599,
                        },
                        statusMessage: {
                            type: 'string',
                        },
                        headers: {
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
            additionalProperties: false,
        },
    },
    reconnecting: {
        schema: {
            type: 'object',
            additionalProperties: false,
        },
    },
    aborted: {
        schema: {
            type: 'object',
            additionalProperties: false,
        },
    },
    'sent-message': {
        schema: {
            type: 'object',
            required: ['data'],
            properties: {
                data: {
                    type: 'object',
                    required: ['type', 'payload'],
                    properties: {
                        type: {
                            type: 'string',
                        },
                        payload: {
                            type: 'string',
                        },
                    },
                    additionalProperties: false,
                },
                mimeType: {
                    type: 'string',
                },
                size: {
                    type: 'integer',
                    minimum: 0,
                },
                fileExtension: {
                    type: 'string',
                },
            },
            additionalProperties: false,
        },
    },
    'received-message': {
        schema: {
            type: 'object',
            required: ['data'],
            properties: {
                data: {
                    type: 'object',
                    required: ['type', 'payload'],
                    properties: {
                        type: {
                            type: 'string',
                        },
                        payload: {
                            type: 'string',
                        },
                    },
                    additionalProperties: false,
                },
                mimeType: {
                    type: 'string',
                },
                size: {
                    type: 'integer',
                    minimum: 0,
                },
                fileExtension: {
                    type: 'string',
                },
            },
            additionalProperties: false,
        },
    },
});
//# sourceMappingURL=events.js.map