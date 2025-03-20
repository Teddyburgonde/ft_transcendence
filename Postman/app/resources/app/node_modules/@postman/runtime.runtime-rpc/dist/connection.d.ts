import { EventEmitter, type RuntimeEvent } from '@postman/runtime.core';
import { type RPCMessage } from './message';
export type MessageEvent = RuntimeEvent<'message', RPCMessage>;
export type ErrorEvent = RuntimeEvent<'error', unknown>;
export type CloseEvent = RuntimeEvent<'close'>;
export type ConnectionEvent = MessageEvent | ErrorEvent | CloseEvent;
export declare abstract class Connection extends EventEmitter<ConnectionEvent> {
    id: string;
    abstract send(message: RPCMessage): void;
    close(): void;
}
