/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import type tls from 'tls';
import { type Socket } from 'socket.io-client-v4';
import * as EventTypes from './connection-events';
export interface ClientOptions {
    url: string | URL;
    clientVersion: '2' | '3' | '4';
    tlsOptions?: TLSOptions;
    headers?: Record<string, string>;
    connectOptions?: {
        handshakeTimeout?: number;
        handshakePath?: string;
    };
    reconnectOptions?: {
        retryCount?: number;
        retryDelay?: number;
    };
}
export interface TLSOptions {
    rejectUnauthorized?: boolean;
    secureContext?: tls.SecureContext | tls.SecureContextOptions;
}
type WithDeepRequired<T, K extends keyof T> = T & {
    [P in K]-?: Required<T[P]>;
};
export declare class Connection extends EventEmitter {
    protected url: URL;
    protected connectionOptions: WithDeepRequired<ClientOptions, 'reconnectOptions'>;
    private reconnectCount;
    private isConnectionAborted;
    protected client: Socket;
    private request?;
    private response?;
    private subscriptions;
    private reconnectTimeoutHandle?;
    constructor(connectionOptions: ClientOptions);
    private createClient;
    private open;
    private createRequestAgent;
    private reconnect;
    private messageHandlerFactory;
    publish(event: string, messages: Array<unknown>, opts?: {
        acknowledgement: boolean;
    }): void;
    subscribe(event: string): void;
    unsubscribe(event: string): void;
    disconnect(): void;
    private onConnectHandler;
    private onDisconnectHandler;
    private onErrorHandler;
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
    emit(event: 'subscribed', payload: EventTypes.SubscribeEvent): boolean;
    on(event: 'subscribed', listener: (this: Connection, arg: EventTypes.SubscribeEvent) => void): this;
    addListener(event: 'subscribed', listener: (this: Connection, arg: EventTypes.SubscribeEvent) => void): this;
    once(event: 'subscribed', listener: (this: Connection, arg: EventTypes.SubscribeEvent) => void): this;
    emit(event: 'unsubscribed', payload: EventTypes.UnsubscribeEvent): boolean;
    on(event: 'unsubscribed', listener: (this: Connection, arg: EventTypes.UnsubscribeEvent) => void): this;
    addListener(event: 'unsubscribed', listener: (this: Connection, arg: EventTypes.UnsubscribeEvent) => void): this;
    once(event: 'unsubscribed', listener: (this: Connection, arg: EventTypes.UnsubscribeEvent) => void): this;
}
export {};
