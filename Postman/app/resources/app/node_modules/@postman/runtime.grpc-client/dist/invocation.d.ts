/// <reference types="node" />
import { EventEmitter } from 'events';
import { Method, MethodKind } from '@postman/runtime.grpc-utils';
import * as grpc from '@postman/grpc-js';
import { Metadata } from './client';
export declare class Invocation extends EventEmitter {
    readonly kind: MethodKind;
    private readonly validate;
    private readonly call;
    private readonly timer;
    constructor(method: Method, fn: Function, metadata: grpc.Metadata, callOptions: grpc.CallOptions, message: any);
    write(json: string): void;
    end(): void;
    cancel(): void;
}
export interface Invocation {
    on(eventName: 'response', listener: (this: Invocation, response: any) => void): this;
    once(eventName: 'response', listener: (this: Invocation, response: any) => void): this;
    addListener(eventName: 'response', listener: (this: Invocation, response: any) => void): this;
    emit(eventName: 'response', response: any): boolean;
    on(eventName: 'metadata', listener: (this: Invocation, metadata: Metadata) => void): this;
    once(eventName: 'metadata', listener: (this: Invocation, metadata: Metadata) => void): this;
    addListener(eventName: 'metadata', listener: (this: Invocation, metadata: Metadata) => void): this;
    emit(eventName: 'metadata', metadata: Metadata): boolean;
    on(eventName: 'status', listener: (this: Invocation, status: Status) => void): this;
    once(eventName: 'status', listener: (this: Invocation, status: Status) => void): this;
    addListener(eventName: 'status', listener: (this: Invocation, status: Status) => void): this;
    emit(eventName: 'status', status: Status): boolean;
    on(eventName: 'error', listener: (this: Invocation, error: unknown) => void): this;
    once(eventName: 'error', listener: (this: Invocation, error: unknown) => void): this;
    addListener(eventName: 'error', listener: (this: Invocation, error: unknown) => void): this;
    emit(eventName: 'error', error: unknown): boolean;
}
export interface Status {
    code: number;
    message: string;
    metadata: Metadata;
    timings: {
        total: number;
    };
}
