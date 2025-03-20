/// <reference path="../src/types.d.ts" />
/// <reference types="node" />
/// <reference types="node/tls" />
import * as tls from 'tls';
import * as grpc from '@postman/grpc-js';
import { Invocation } from './invocation';
export interface ClientOptions {
    url: string;
    descriptor: unknown;
    includeDefaultFields?: boolean;
    channelOptions?: ChannelOptions;
    callOptions?: CallOptions;
    tlsOptions?: TLSOptions;
    proxy?: string;
}
export interface TLSOptions {
    rejectUnauthorized?: boolean;
    secureContext?: tls.SecureContext | tls.SecureContextOptions;
}
export interface InvokeOptions {
    metadata?: Metadata;
    message?: string;
    callOptions?: CallOptions;
}
export type Metadata = ReadonlyArray<Readonly<[string, string | Uint8Array]>>;
export type ChannelOptions = grpc.ChannelOptions;
export type CallOptions = {
    connectionTimeout?: number;
} | {
    deadline?: grpc.Deadline;
};
export declare class Client {
    private readonly methods;
    constructor(options: ClientOptions);
    invoke(method: string, options?: InvokeOptions): Invocation;
}
