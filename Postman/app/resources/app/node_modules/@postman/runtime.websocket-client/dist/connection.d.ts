/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import type tls from 'tls';
import type * as EventTypes from './connection-events';
export interface ClientOptions {
    url: string | URL;
    connectOptions?: {
        handshakeTimeout?: number;
        maxPayload?: number;
        followRedirects?: boolean;
    };
    reconnectOptions?: {
        retryCount?: number;
        retryDelay?: number;
    };
    protocols?: string | string[];
    tlsOptions?: TLSOptions;
    headers?: Record<string, string>;
}
export interface TLSOptions {
    rejectUnauthorized?: boolean;
    secureContext?: tls.SecureContext | tls.SecureContextOptions;
}
export interface Connection {
    emit(event: 'error', payload: EventTypes.ErrorEvent): boolean;
    on(event: 'error', listener: (this: Connection, arg: EventTypes.ErrorEvent) => void): this;
    addListener(event: 'error', listener: (this: Connection, arg: EventTypes.ErrorEvent) => void): this;
    once(event: 'error', listener: (this: Connection, arg: EventTypes.ErrorEvent) => void): this;
    emit(event: 'end', payload: EventTypes.ConnectionEndEvent): boolean;
    on(event: 'end', listener: (this: Connection, arg: EventTypes.ConnectionEndEvent) => void): this;
    addListener(event: 'end', listener: (this: Connection, arg: EventTypes.ConnectionEndEvent) => void): this;
    once(event: 'end', listener: (this: Connection, arg: EventTypes.ConnectionEndEvent) => void): this;
    emit(event: 'upgrade', payload: EventTypes.UpgradeEvent): boolean;
    on(event: 'upgrade', listener: (this: Connection, arg: EventTypes.UpgradeEvent) => void): this;
    addListener(event: 'upgrade', listener: (this: Connection, arg: EventTypes.UpgradeEvent) => void): this;
    once(event: 'upgrade', listener: (this: Connection, arg: EventTypes.UpgradeEvent) => void): this;
    emit(event: 'open', payload: EventTypes.OpenEvent): boolean;
    on(event: 'open', listener: (this: Connection, arg: EventTypes.OpenEvent) => void): this;
    addListener(event: 'open', listener: (this: Connection, arg: EventTypes.OpenEvent) => void): this;
    once(event: 'open', listener: (this: Connection, arg: EventTypes.OpenEvent) => void): this;
    emit(event: 'close', payload: EventTypes.CloseEvent): boolean;
    on(event: 'close', listener: (this: Connection, arg: EventTypes.CloseEvent) => void): this;
    addListener(event: 'close', listener: (this: Connection, arg: EventTypes.CloseEvent) => void): this;
    once(event: 'close', listener: (this: Connection, arg: EventTypes.CloseEvent) => void): this;
    emit(event: 'message', payload: EventTypes.MessageEvent): boolean;
    on(event: 'message', listener: (this: Connection, arg: EventTypes.MessageEvent) => void): this;
    addListener(event: 'message', listener: (this: Connection, arg: EventTypes.MessageEvent) => void): this;
    once(event: 'message', listener: (this: Connection, arg: EventTypes.MessageEvent) => void): this;
    emit(event: 'reconnect', payload: EventTypes.ReconnectEvent): boolean;
    on(event: 'reconnect', listener: (this: Connection, arg: EventTypes.ReconnectEvent) => void): this;
    addListener(event: 'reconnect', listener: (this: Connection, arg: EventTypes.ReconnectEvent) => void): this;
    once(event: 'reconnect', listener: (this: Connection, arg: EventTypes.ReconnectEvent) => void): this;
}
export declare class Connection extends EventEmitter {
    private client;
    private reconnectCount;
    private connectionOptions;
    private isConnectionAborted;
    constructor(connectionOptions: ClientOptions);
    private open;
    send(message: string | Uint8Array): void;
    private extractRequestResponseFromClient;
    private reconnect;
    close(code?: number, reason?: string): void;
}
