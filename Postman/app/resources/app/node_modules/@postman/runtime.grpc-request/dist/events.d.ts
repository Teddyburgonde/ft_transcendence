import { FromSchema } from 'json-schema-to-ts';
import { Event } from '@postman/runtime.core';
declare const definition: {
    'sent-request-header': {
        schema: {
            readonly type: "object";
            readonly required: ["metadata", "isRequestStreamed", "isResponseStreamed"];
            readonly properties: {
                readonly metadata: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: ["key", "value"];
                        readonly properties: {
                            readonly key: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly type: "string";
                            };
                        };
                        readonly additionalProperties: false;
                    };
                };
                readonly isRequestStreamed: {
                    readonly type: "boolean";
                };
                readonly isResponseStreamed: {
                    readonly type: "boolean";
                };
            };
            readonly additionalProperties: false;
        };
    };
    'received-response-header': {
        schema: {
            readonly type: "object";
            readonly required: ["metadata"];
            readonly properties: {
                readonly metadata: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: ["key", "value"];
                        readonly properties: {
                            readonly key: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly type: "string";
                            };
                        };
                        readonly additionalProperties: false;
                    };
                };
            };
            readonly additionalProperties: false;
        };
    };
    'sent-request-data': {
        schema: {
            readonly type: "object";
            readonly required: ["data"];
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                };
            };
            readonly additionalProperties: false;
        };
    };
    'received-response-data': {
        schema: {
            readonly type: "object";
            readonly required: ["data"];
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                };
            };
            readonly additionalProperties: false;
        };
    };
    status: {
        schema: {
            readonly type: "object";
            readonly required: ["statusCode", "statusMessage", "metadata"];
            readonly properties: {
                readonly statusCode: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly statusMessage: {
                    readonly type: "string";
                };
                readonly metadata: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: ["key", "value"];
                        readonly properties: {
                            readonly key: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly type: "string";
                            };
                        };
                        readonly additionalProperties: false;
                    };
                };
                readonly timings: {
                    readonly type: "object";
                    readonly required: ["total"];
                    readonly properties: {
                        readonly total: {
                            readonly type: "number";
                            readonly minimum: 0;
                        };
                    };
                    readonly additionalProperties: false;
                };
            };
            readonly additionalProperties: false;
        };
    };
    'internal:error': {
        schema: {
            type: "object";
            required: ["message"];
            properties: {
                message: {
                    type: "string";
                };
            };
        };
    };
    'internal:transient-error': {
        schema: {
            type: "object";
            required: ["message"];
            properties: {
                message: {
                    type: "string";
                };
            };
        };
    };
};
export type SentRequestHeader = Event<'sent-request-header', FromSchema<(typeof definition)['sent-request-header']['schema']>>;
export type ReceivedResponseHeader = Event<'received-response-header', FromSchema<(typeof definition)['received-response-header']['schema']>>;
export type SentRequestData = Event<'sent-request-data', FromSchema<(typeof definition)['sent-request-data']['schema']>>;
export type ReceivedResponseData = Event<'received-response-data', FromSchema<(typeof definition)['received-response-data']['schema']>>;
export type Status = Event<'status', FromSchema<(typeof definition)['status']['schema']>>;
export type InternalError = Event<'internal:error', FromSchema<(typeof definition)['internal:error']['schema']>>;
export type InternalTransientError = Event<'internal:transient-error', FromSchema<(typeof definition)['internal:transient-error']['schema']>>;
export type Write = Event<'write', {
    json: string;
}>;
export type End = Event<'end'>;
export type Cancel = Event<'cancel'>;
export {};
