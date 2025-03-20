import { FromSchema } from 'json-schema-to-ts';
import { ItemType } from '@postman/runtime.core';
import Documentation from '@postman/runtime.documentation';
import Variables from '@postman/runtime.variables';
import Schema from '@postman/runtime.schema';
import Auth from '@postman/runtime.auth';
import Events from '@postman/runtime.events';
import { GRPCAgent } from './agent';
import * as GRPCEvents from './events';
export * as GRPCEvents from './events';
export * from './agent';
declare const definition: {
    name: "grpc-request";
    summary: "gRPC Request";
    schema: {
        readonly type: "object";
        readonly required: ["url", "methodPath", "message", "metadata"];
        readonly properties: {
            readonly url: {
                readonly type: "string";
            };
            readonly methodPath: {
                readonly type: "string";
            };
            readonly methodDescriptor: {
                readonly type: "string";
            };
            readonly message: {
                readonly type: "object";
                readonly required: ["content"];
                readonly properties: {
                    readonly content: {
                        readonly type: "string";
                    };
                };
                readonly additionalProperties: false;
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
                        readonly description: {
                            readonly type: "string";
                        };
                        readonly disabled: {
                            readonly type: "boolean";
                        };
                    };
                    readonly additionalProperties: false;
                };
            };
            readonly settings: {
                readonly type: "object";
                readonly properties: {
                    readonly secureConnection: {
                        readonly type: "boolean";
                    };
                    readonly strictSSL: {
                        readonly type: "boolean";
                    };
                    readonly serverNameOverride: {
                        readonly type: "string";
                    };
                    readonly maxResponseMessageSize: {
                        readonly type: "number";
                    };
                    readonly includeDefaultFields: {
                        readonly type: "boolean";
                    };
                    readonly connectionTimeout: {
                        readonly type: "number";
                    };
                };
                readonly additionalProperties: false;
            };
        };
        readonly additionalProperties: false;
    };
    constraints: [{
        constraint: "allow-child-types";
        allowed: ["grpc-example"];
    }, {
        constraint: "allow-extensions";
        allowed: ["auth", "schema", "events", "documentation", "variables"];
    }];
};
declare namespace GRPCRequest {
    type Payload = FromSchema<typeof definition.schema>;
    type Extensions = Documentation | Schema | Variables | Auth | Events;
    type Config = GRPCAgent;
    type SentEvents = GRPCEvents.Write | GRPCEvents.End | GRPCEvents.Cancel;
    type ReceivedEvents = GRPCEvents.SentRequestHeader | GRPCEvents.ReceivedResponseHeader | GRPCEvents.SentRequestData | GRPCEvents.ReceivedResponseData | GRPCEvents.Status | GRPCEvents.InternalError | GRPCEvents.InternalTransientError;
    const use: () => ItemType.Specific<{
        methodDescriptor?: string | undefined;
        settings?: {
            secureConnection?: boolean | undefined;
            strictSSL?: boolean | undefined;
            serverNameOverride?: string | undefined;
            maxResponseMessageSize?: number | undefined;
            includeDefaultFields?: boolean | undefined;
            connectionTimeout?: number | undefined;
        } | undefined;
        url: string;
        methodPath: string;
        message: {
            content: string;
        };
        metadata: {
            description?: string | undefined;
            disabled?: boolean | undefined;
            key: string;
            value: string;
        }[];
    }, Extensions, GRPCAgent, SentEvents, ReceivedEvents>;
}
type GRPCRequest = ItemType.Specific<GRPCRequest.Payload, GRPCRequest.Extensions, GRPCRequest.Config, GRPCRequest.SentEvents, GRPCRequest.ReceivedEvents>;
export default GRPCRequest;
