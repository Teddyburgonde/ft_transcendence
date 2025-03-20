import { FromSchema } from 'json-schema-to-ts';
import { ItemType } from '@postman/runtime.core';
import Documentation from '@postman/runtime.documentation';
import Variables from '@postman/runtime.variables';
import * as SocketIOEvents from './events';
import { SocketIOAgent } from './agent';
export * as SocketIOEvents from './events';
export * from './agent';
declare const definition: {
    name: "ws-socketio-request";
    summary: "Socket.IO Request";
    schema: {
        type: "object";
        properties: {
            url: {
                type: "string";
            };
            headers: {
                type: "array";
                items: {
                    type: "object";
                    required: ["key", "value"];
                    properties: {
                        key: {
                            type: "string";
                        };
                        value: {
                            type: "string";
                        };
                        description: {
                            type: "string";
                        };
                        disabled: {
                            type: "boolean";
                        };
                    };
                    additionalProperties: false;
                };
            };
            queryParams: {
                type: "array";
                items: {
                    type: "object";
                    required: ["key", "value"];
                    properties: {
                        key: {
                            type: ["string", "null"];
                        };
                        value: {
                            type: ["string", "null"];
                        };
                        description: {
                            type: "string";
                        };
                        disabled: {
                            type: "boolean";
                        };
                    };
                    additionalProperties: false;
                };
            };
            settings: {
                type: "object";
                properties: {
                    version: {
                        type: "string";
                        enum: ["2", "3", "4"];
                    };
                    path: {
                        type: "string";
                    };
                    handshakeTimeout: {
                        type: "integer";
                        minimum: 0;
                    };
                    retryCount: {
                        type: "integer";
                        minimum: 0;
                    };
                    retryDelay: {
                        type: "integer";
                        minimum: 0;
                    };
                    strictSSL: {
                        type: "boolean";
                    };
                };
                additionalProperties: false;
            };
            events: {
                type: "array";
                items: {
                    type: "object";
                    required: ["name"];
                    properties: {
                        name: {
                            type: "string";
                        };
                        description: {
                            type: "string";
                        };
                        subscribeOnConnect: {
                            type: "boolean";
                        };
                    };
                    additionalProperties: false;
                };
            };
        };
        additionalProperties: false;
    };
    constraints: [{
        constraint: "allow-child-types";
        allowed: ["ws-socketio-message"];
    }, {
        constraint: "allow-extensions";
        allowed: ["documentation", "variables"];
    }];
};
declare namespace SocketIORequest {
    type Payload = FromSchema<typeof definition.schema>;
    type Extensions = Documentation | Variables;
    type Config = SocketIOAgent;
    type SentEvents = SocketIOEvents.Publish | SocketIOEvents.Disconnect | SocketIOEvents.Subscribe | SocketIOEvents.Unsubscribe;
    type ReceivedEvents = SocketIOEvents.Connected | SocketIOEvents.Error | SocketIOEvents.SentMessage | SocketIOEvents.ReceivedMessage | SocketIOEvents.Disconnected | SocketIOEvents.Reconnecting | SocketIOEvents.SubscribeEvent | SocketIOEvents.UnsubscribeEvent | SocketIOEvents.Aborted;
    const use: () => ItemType.Specific<{
        headers?: {
            description?: string | undefined;
            disabled?: boolean | undefined;
            key: string;
            value: string;
        }[] | undefined;
        url?: string | undefined;
        queryParams?: {
            description?: string | undefined;
            disabled?: boolean | undefined;
            key: string | null;
            value: string | null;
        }[] | undefined;
        settings?: {
            version?: "2" | "3" | "4" | undefined;
            path?: string | undefined;
            handshakeTimeout?: number | undefined;
            retryCount?: number | undefined;
            retryDelay?: number | undefined;
            strictSSL?: boolean | undefined;
        } | undefined;
        events?: {
            description?: string | undefined;
            subscribeOnConnect?: boolean | undefined;
            name: string;
        }[] | undefined;
    }, Extensions, SocketIOAgent, SentEvents, ReceivedEvents>;
}
type SocketIORequest = ItemType.Specific<SocketIORequest.Payload, SocketIORequest.Extensions, SocketIORequest.Config, SocketIORequest.SentEvents, SocketIORequest.ReceivedEvents>;
export default SocketIORequest;
