"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
// TODO: this JSON schema is not currently being used at runtime
const definition = (0, json_schema_to_ts_1.asConst)({
    connected: {
        schema: {
            type: 'object',
            properties: {
                packet: {
                    type: 'object',
                    required: ['cmd', 'sessionPresent'],
                    properties: {
                        cmd: {
                            type: 'string',
                            enum: ['connack'],
                        },
                        messageId: {
                            type: 'number',
                        },
                        dup: {
                            type: 'boolean',
                        },
                        length: {
                            type: 'number',
                        },
                        returnCode: {
                            type: 'number',
                        },
                        reasonCode: {
                            type: 'number',
                        },
                        sessionPresent: {
                            type: 'boolean',
                        },
                        properties: {
                            type: 'object',
                            properties: {
                                sessionExpiryInterval: {
                                    type: 'number',
                                },
                                receiveMaximum: {
                                    type: 'number',
                                },
                                maximumQoS: {
                                    type: 'number',
                                },
                                retainAvailable: {
                                    type: 'boolean',
                                },
                                maximumPacketSize: {
                                    type: 'number',
                                },
                                assignedClientIdentifier: {
                                    type: 'string',
                                },
                                topicAliasMaximum: {
                                    type: 'number',
                                },
                                reasonString: {
                                    type: 'string',
                                },
                                userProperties: {
                                    type: 'object',
                                    additionalProperties: {
                                        oneOf: [
                                            {
                                                type: 'string',
                                            },
                                            {
                                                type: 'array',
                                                items: {
                                                    type: 'string',
                                                },
                                            },
                                        ],
                                    },
                                },
                                wildcardSubscriptionAvailable: {
                                    type: 'boolean',
                                },
                                subscriptionIdentifiersAvailable: {
                                    type: 'boolean',
                                },
                                sharedSubscriptionAvailable: {
                                    type: 'boolean',
                                },
                                serverKeepAlive: {
                                    type: 'number',
                                },
                                responseInformation: {
                                    type: 'string',
                                },
                                serverReference: {
                                    type: 'string',
                                },
                                authenticationMethod: {
                                    type: 'string',
                                },
                                authenticationData: {
                                    type: 'string',
                                    format: 'binary',
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                    additionalProperties: false,
                },
                url: {
                    type: 'string',
                },
                connected: {
                    type: 'boolean',
                },
            },
            additionalProperties: false,
        },
    },
    error: {
        schema: {
            type: 'object',
            properties: {
                error: {
                    type: 'string',
                },
            },
            additionalProperties: false,
        },
    },
    'outgoing-packet': {
        schema: {
            type: 'object',
            properties: {
                packet: {
                    oneOf: [
                        {
                            type: 'object',
                            required: ['cmd'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    enum: ['puback', 'pubcomp', 'pubrel', 'pubrec'],
                                },
                                messageId: {
                                    type: 'number',
                                },
                                length: {
                                    type: 'number',
                                },
                                reasonCode: {
                                    type: 'number',
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'qos', 'topic', 'payload'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'publish',
                                },
                                messageId: {
                                    type: 'number',
                                },
                                length: {
                                    type: 'number',
                                },
                                qos: {
                                    type: 'number',
                                    enum: [0, 1, 2],
                                },
                                dup: {
                                    type: 'boolean',
                                },
                                retain: {
                                    type: 'boolean',
                                },
                                topic: {
                                    type: 'string',
                                },
                                payload: {
                                    type: 'string',
                                },
                                message: {
                                    oneOf: [
                                        {
                                            type: 'string',
                                        },
                                        {
                                            type: 'number',
                                        },
                                        {
                                            type: 'object',
                                            additionalProperties: true,
                                        },
                                    ],
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'granted'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'suback',
                                },
                                messageId: {
                                    type: 'number',
                                },
                                length: {
                                    type: 'number',
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                granted: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            topic: {
                                                type: 'string',
                                            },
                                            qos: {
                                                type: 'number',
                                            },
                                        },
                                        required: ['topic'],
                                    },
                                },
                            },
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'granted'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'unsuback',
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                granted: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            topic: {
                                                type: 'string',
                                            },
                                        },
                                        required: ['topic'],
                                    },
                                },
                                length: {
                                    type: 'number',
                                },
                                messageId: {
                                    type: 'number',
                                },
                            },
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'unsubscriptions'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'unsubscribe',
                                },
                                messageId: {
                                    type: 'number',
                                },
                                dup: {
                                    type: 'boolean',
                                },
                                length: {
                                    type: 'number',
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                unsubscriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'subscriptions'],
                            additionalProperties: false,
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'subscribe',
                                },
                                messageId: {
                                    type: 'number',
                                },
                                length: {
                                    type: 'number',
                                },
                                subscriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        additionalProperties: false,
                                        required: ['topic', 'qos'],
                                        properties: {
                                            topic: {
                                                type: 'string',
                                            },
                                            qos: {
                                                type: 'number',
                                                enum: [0, 1, 2],
                                            },
                                            nl: {
                                                type: 'boolean',
                                            },
                                            rap: {
                                                type: 'boolean',
                                            },
                                            rh: {
                                                type: 'number',
                                            },
                                        },
                                    },
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            additionalProperties: false,
        },
    },
    'incoming-packet': {
        schema: {
            type: 'object',
            properties: {
                packet: {
                    oneOf: [
                        {
                            type: 'object',
                            required: ['cmd'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    enum: ['puback', 'pubcomp', 'pubrel', 'pubrec'],
                                },
                                messageId: {
                                    type: 'number',
                                },
                                length: {
                                    type: 'number',
                                },
                                reasonCode: {
                                    type: 'number',
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'qos', 'topic', 'payload'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'publish',
                                },
                                messageId: {
                                    type: 'number',
                                },
                                length: {
                                    type: 'number',
                                },
                                qos: {
                                    type: 'number',
                                    enum: [0, 1, 2],
                                },
                                dup: {
                                    type: 'boolean',
                                },
                                retain: {
                                    type: 'boolean',
                                },
                                topic: {
                                    type: 'string',
                                },
                                payload: {
                                    type: 'string',
                                },
                                message: {
                                    oneOf: [
                                        {
                                            type: 'string',
                                        },
                                        {
                                            type: 'number',
                                        },
                                        {
                                            type: 'object',
                                            additionalProperties: true,
                                        },
                                    ],
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'granted'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'suback',
                                },
                                messageId: {
                                    type: 'number',
                                },
                                length: {
                                    type: 'number',
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                granted: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            topic: {
                                                type: 'string',
                                            },
                                            qos: {
                                                type: 'number',
                                            },
                                        },
                                        required: ['topic'],
                                    },
                                },
                            },
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'granted'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'unsuback',
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                granted: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            topic: {
                                                type: 'string',
                                            },
                                        },
                                        required: ['topic'],
                                    },
                                },
                                length: {
                                    type: 'number',
                                },
                                messageId: {
                                    type: 'number',
                                },
                            },
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'unsubscriptions'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'unsubscribe',
                                },
                                messageId: {
                                    type: 'number',
                                },
                                dup: {
                                    type: 'boolean',
                                },
                                length: {
                                    type: 'number',
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                unsubscriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                        {
                            type: 'object',
                            required: ['cmd', 'subscriptions'],
                            properties: {
                                cmd: {
                                    type: 'string',
                                    const: 'subscribe',
                                },
                                messageId: {
                                    type: 'number',
                                },
                                length: {
                                    type: 'number',
                                },
                                subscriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['topic', 'qos'],
                                        properties: {
                                            topic: {
                                                type: 'string',
                                            },
                                            qos: {
                                                type: 'number',
                                                enum: [0, 1, 2],
                                            },
                                            nl: {
                                                type: 'boolean',
                                            },
                                            rap: {
                                                type: 'boolean',
                                            },
                                            rh: {
                                                type: 'number',
                                            },
                                        },
                                    },
                                },
                                properties: {
                                    type: 'object',
                                    properties: {
                                        reasonString: {
                                            type: 'string',
                                        },
                                        userProperties: {
                                            type: 'object',
                                            additionalProperties: {
                                                oneOf: [
                                                    {
                                                        type: 'string',
                                                    },
                                                    {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string',
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
                contentType: {
                    type: 'string',
                },
            },
            additionalProperties: false,
        },
    },
    'transport:ws:connected': {
        schema: {
            type: 'object',
            properties: {
                handshakeRequest: {
                    type: 'object',
                    required: ['method', 'headers'],
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
    'transport:ws:disconnected': {
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
    'transport:ws:error': {
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
                    required: ['method', 'headers'],
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
                message: {
                    type: 'string',
                },
                packet: {
                    type: 'object',
                    properties: {
                        cmd: {
                            type: 'string',
                            enum: ['disconnect'],
                        },
                        reasonCode: {
                            type: 'number',
                        },
                        properties: {
                            type: 'object',
                            properties: {
                                sessionExpiryInterval: {
                                    type: 'number',
                                },
                                reasonString: {
                                    type: 'string',
                                },
                                userProperties: {
                                    type: 'object',
                                    additionalProperties: {
                                        oneOf: [
                                            {
                                                type: 'string',
                                            },
                                            {
                                                type: 'array',
                                                items: {
                                                    type: 'string',
                                                },
                                            },
                                        ],
                                    },
                                },
                                serverReference: {
                                    type: 'string',
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                    required: ['cmd'],
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
});
//# sourceMappingURL=events.js.map