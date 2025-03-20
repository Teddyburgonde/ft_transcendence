/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { HTTPRequest, HTTPResponse } from '../connection-events';
type Constructor<T> = new (...args: any[]) => T;
interface MixinClass extends EventEmitter {
    on(event: 'request-meta', listener: (request: HTTPRequest) => void): this;
    emit(event: 'request-meta', payload: HTTPRequest): boolean;
    on(event: 'response-meta', listener: (response: HTTPResponse) => void): this;
    emit(event: 'response-meta', payload: HTTPResponse): boolean;
}
export default function RequestResponseEmitterMixin<T extends Constructor<MixinClass>>(Superclass: T): {
    new (...args: any[]): {
        createConnection(...args: any): any;
        on(event: "request-meta", listener: (request: HTTPRequest) => void): any;
        on(event: "response-meta", listener: (response: HTTPResponse) => void): any;
        emit(event: "request-meta", payload: HTTPRequest): boolean;
        emit(event: "response-meta", payload: HTTPResponse): boolean;
        [EventEmitter.captureRejectionSymbol]?(error: Error, event: string, ...args: any[]): void;
        addListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
        once(eventName: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
        off(eventName: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(eventName: string | symbol): Function[];
        rawListeners(eventName: string | symbol): Function[];
        listenerCount(eventName: string | symbol, listener?: Function | undefined): number;
        prependListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
} & T;
export {};
