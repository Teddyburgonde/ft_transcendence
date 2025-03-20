import { Initializer, MethodHandler } from './types';
export { default as EventEmitter } from './event-emitter';
export { default as ProxyState } from './proxy-state';
export { default as ProxyResult } from './proxy-result';
export { default as ProxyRemote, ProxyObject } from './proxy-remote';
export * from './types';
export declare class Client {
    private readonly _sessions;
    private readonly _getSession;
    private _lastCancellation;
    constructor(initializer: Initializer, options?: {
        timeout?: number;
    });
    invoke<T = any>(methodName: string, params?: object, abortSignal?: AbortSignal): Promise<T>;
    cancel(): void;
}
export declare class Server {
    protected options: {
        heartbeat?: {
            interval?: number;
            tries?: number;
        };
    };
    private readonly _rpcMethods;
    private readonly _sessions;
    private _lastShutdown;
    constructor(rpcMethods: Record<string, MethodHandler>, options?: {
        heartbeat?: {
            interval?: number;
            tries?: number;
        };
    });
    newSession(initializer: Initializer): Promise<void>;
    shutdown(): void;
    get size(): number;
}
