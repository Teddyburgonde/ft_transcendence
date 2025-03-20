import { SecureContextOptions } from '@postman/runtime.core';
import { Connection } from './connection';
export type ClientOptions = {
    url: string;
    tlsOptions?: tlsOptions | null;
    mqttOptions?: MQTTClientOptions | null;
};
export type tlsOptions = {
    rejectUnauthorized?: boolean;
    secureContext?: SecureContextOptions;
};
export type MQTTClientOptions = {
    clientId?: string;
    version?: 4 | 5;
    cleanSession?: boolean;
    keepAlive?: number;
    autoReconnect?: boolean;
    properties?: {
        sessionExpiryInterval?: number;
        receiveMaximum?: number;
        maximumPacketSize?: number;
        userProperties?: Array<{
            key: string;
            value: string;
            disabled?: boolean;
            description?: string;
        }>;
    };
    lastWill?: {
        payload?: string;
        topic?: string;
        qos?: number;
        retain?: boolean;
        properties?: {
            payloadFormatIndicator?: boolean;
            messageExpiryInterval?: number;
            willDelayInterval?: number;
            responseTopic?: string;
            correlationData?: string;
            contentType?: string;
            userProperties?: Array<{
                key: string;
                value: string;
            }>;
        };
    };
    username?: string;
    password?: string;
};
export declare class Client {
    private client;
    constructor(options: ClientOptions);
    connect(): Connection;
}
