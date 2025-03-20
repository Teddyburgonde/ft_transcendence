import { FromSchema } from 'json-schema-to-ts';
import { ItemType } from '@postman/runtime.core';
import Documentation from '@postman/runtime.documentation';
import Variables from '@postman/runtime.variables';
import * as WebsocketEvents from './events';
import { WebsocketAgent } from './agent';
export * as WebsocketEvents from './events';
export * from './agent';
declare const definition: {
    name: "ws-raw-request";
    summary: "Raw WebSocket Request";
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
                    handshakeTimeout: {
                        type: "integer";
                        minimum: 0;
                    };
                    retryCount: {
                        type: "integer";
                        minimum: 0;
                    };
                    maxPayload: {
                        type: "number";
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
        };
        additionalProperties: false;
    };
    constraints: [{
        constraint: "allow-child-types";
        allowed: ["ws-raw-message"];
    }, {
        constraint: "allow-extensions";
        allowed: ["documentation", "variables"];
    }];
};
declare namespace WebsocketRequest {
    type Payload = FromSchema<typeof definition.schema>;
    type Extensions = Documentation | Variables;
    type Config = WebsocketAgent;
    type SentEvents = WebsocketEvents.Publish | WebsocketEvents.Close;
    type ReceivedEvents = WebsocketEvents.Connected | WebsocketEvents.Error | WebsocketEvents.SentMessage | WebsocketEvents.ReceivedMessage | WebsocketEvents.Disconnected | WebsocketEvents.Reconnecting | WebsocketEvents.Aborted;
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
            handshakeTimeout?: number | undefined;
            retryCount?: number | undefined;
            maxPayload?: number | undefined;
            retryDelay?: number | undefined;
            strictSSL?: boolean | undefined;
        } | undefined;
    }, Extensions, WebsocketAgent, SentEvents, ReceivedEvents>;
}
type WebsocketRequest = ItemType.Specific<WebsocketRequest.Payload, WebsocketRequest.Extensions, WebsocketRequest.Config, WebsocketRequest.SentEvents, WebsocketRequest.ReceivedEvents>;
export default WebsocketRequest;
