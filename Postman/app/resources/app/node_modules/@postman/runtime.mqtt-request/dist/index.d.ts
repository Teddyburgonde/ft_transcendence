import { FromSchema } from 'json-schema-to-ts';
import { ItemType } from '@postman/runtime.core';
import Documentation from '@postman/runtime.documentation';
import Variables from '@postman/runtime.variables';
import Auth from '@postman/runtime.auth';
import { MQTTAgent } from './agent';
import * as MQTTEvents from './events';
export * as MQTTEvents from './events';
export * from './agent';
declare const definition: {
    name: "mqtt-request";
    summary: "MQTT Request";
    schema: {
        readonly type: "object";
        readonly required: ["url"];
        readonly properties: {
            readonly url: {
                readonly type: "string";
            };
            readonly clientId: {
                readonly type: "string";
            };
            readonly version: {
                readonly type: "integer";
                readonly enum: readonly [4, 5];
            };
            readonly topics: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: ["name"];
                    readonly properties: {
                        readonly name: {
                            readonly type: "string";
                        };
                        readonly qos: {
                            readonly type: "integer";
                            readonly enum: readonly [0, 1, 2];
                        };
                        readonly subscribe: {
                            readonly type: "boolean";
                        };
                        readonly description: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly lastWill: {
                readonly type: "object";
                readonly properties: {
                    readonly payload: {
                        readonly type: "string";
                    };
                    readonly topic: {
                        readonly type: "string";
                    };
                    readonly qos: {
                        readonly type: "integer";
                        readonly enum: readonly [0, 1, 2];
                    };
                    readonly retain: {
                        readonly type: "boolean";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["text", "json", "hex", "base64"];
                    };
                    readonly properties: {
                        readonly type: "object";
                        readonly properties: {
                            readonly payloadFormatIndicator: {
                                readonly type: "boolean";
                            };
                            readonly messageExpiryInterval: {
                                readonly type: "integer";
                                readonly minimum: 0;
                            };
                            readonly willDelayInterval: {
                                readonly type: "integer";
                                readonly minimum: 0;
                            };
                            readonly responseTopic: {
                                readonly type: "string";
                            };
                            readonly correlationData: {
                                readonly type: "string";
                            };
                            readonly contentType: {
                                readonly type: "string";
                            };
                            readonly userProperties: {
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
            };
            readonly properties: {
                readonly type: "object";
                readonly properties: {
                    readonly sessionExpiryInterval: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly receiveMaximum: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly maximumPacketSize: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly userProperties: {
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
                };
            };
            readonly settings: {
                readonly type: "object";
                readonly properties: {
                    readonly cleanSession: {
                        readonly type: "boolean";
                    };
                    readonly keepAlive: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly autoReconnect: {
                        readonly type: "boolean";
                    };
                    readonly connectionTimeout: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly strictSSL: {
                        readonly type: "boolean";
                    };
                };
                readonly additionalProperties: false;
            };
        };
        readonly additionalProperties: false;
    };
    constraints: [{
        constraint: "allow-child-types";
        allowed: ["mqtt-message"];
    }, {
        constraint: "allow-extensions";
        allowed: ["auth", "documentation", "variables"];
    }];
};
declare namespace MQTTRequest {
    type Payload = FromSchema<typeof definition.schema>;
    type Extensions = Documentation | Variables | Auth;
    type Config = MQTTAgent;
    type SentEvents = MQTTEvents.Publish | MQTTEvents.Subscribe | MQTTEvents.Unsubscribe | MQTTEvents.Disconnect | MQTTEvents.Cancel;
    type ReceivedEvents = MQTTEvents.Connected | MQTTEvents.OutgoingPacket | MQTTEvents.IncomingPacket | MQTTEvents.Error | MQTTEvents.TransportWSConnected | MQTTEvents.TransportWSDisconnected | MQTTEvents.TransportWSError | MQTTEvents.Disconnected | MQTTEvents.Reconnecting | MQTTEvents.Aborted;
    const use: () => ItemType.Specific<{
        properties?: {
            [x: string]: unknown;
            sessionExpiryInterval?: number | undefined;
            receiveMaximum?: number | undefined;
            maximumPacketSize?: number | undefined;
            userProperties?: {
                description?: string | undefined;
                disabled?: boolean | undefined;
                key: string;
                value: string;
            }[] | undefined;
        } | undefined;
        clientId?: string | undefined;
        version?: 4 | 5 | undefined;
        topics?: {
            [x: string]: unknown;
            description?: string | undefined;
            qos?: 0 | 2 | 1 | undefined;
            subscribe?: boolean | undefined;
            name: string;
        }[] | undefined;
        lastWill?: {
            [x: string]: unknown;
            properties?: {
                userProperties?: {
                    key: string;
                    value: string;
                }[] | undefined;
                contentType?: string | undefined;
                payloadFormatIndicator?: boolean | undefined;
                messageExpiryInterval?: number | undefined;
                willDelayInterval?: number | undefined;
                responseTopic?: string | undefined;
                correlationData?: string | undefined;
            } | undefined;
            type?: "text" | "json" | "hex" | "base64" | undefined;
            qos?: 0 | 2 | 1 | undefined;
            topic?: string | undefined;
            payload?: string | undefined;
            retain?: boolean | undefined;
        } | undefined;
        settings?: {
            cleanSession?: boolean | undefined;
            keepAlive?: number | undefined;
            autoReconnect?: boolean | undefined;
            connectionTimeout?: number | undefined;
            strictSSL?: boolean | undefined;
        } | undefined;
        url: string;
    }, Extensions, MQTTAgent, SentEvents, ReceivedEvents>;
}
type MQTTRequest = ItemType.Specific<MQTTRequest.Payload, MQTTRequest.Extensions, MQTTRequest.Config, MQTTRequest.SentEvents, MQTTRequest.ReceivedEvents>;
export default MQTTRequest;
