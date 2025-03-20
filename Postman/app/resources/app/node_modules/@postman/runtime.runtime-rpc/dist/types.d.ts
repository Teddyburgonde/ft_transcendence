export type CloseReason = 'NORMAL' | 'TIMEOUT' | 'PROTOCOL_VIOLATION';
export type SessionData = Record<string | symbol | number, any>;
export interface Initializer {
    (controller: Controller): Connection | Promise<Connection>;
}
export interface Controller {
    receive(message: Uint8Array): void;
    destroy(err?: Error | null | undefined): void;
}
export interface Connection {
    send(message: Uint8Array): void;
    close(reason: CloseReason): void;
    isOpen(): boolean;
    onActive?(): void;
    onIdle?(): void;
}
export interface MethodHandler<T extends Record<string, any> = Record<string, any>> {
    (data: T, ctx: MethodContext): void | Record<string, any> | Promise<void | Record<string, any>>;
}
export interface MethodContext {
    signal: AbortSignal;
    session: SessionData;
}
