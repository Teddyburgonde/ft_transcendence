import ProxyState from './proxy-state';
import EventEmitter from './event-emitter';
export declare const INTERNAL: unique symbol;
export default class ProxyRemote extends ProxyState {
    private readonly _hooks;
    private readonly _events;
    constructor(internal: Symbol, hooks: ProxyHooks);
    get events(): EventEmitter;
    call<T = any>(method: string, ...data: any[]): Promise<T>;
    toProxy<T extends {}>(unidirectionalMethods?: ReadonlyArray<keyof T>, bidirectionalMethods?: ReadonlyArray<keyof T>): ProxyObject<T>;
    protected _connected(): boolean;
    protected _disconnect(err: Error | undefined): void;
}
export interface ProxyHooks {
    connected(): boolean;
    disconnect(err: Error | undefined): void;
    call<T = any>(method: string, ...data: any[]): Promise<T>;
}
export type ProxyObject<T extends {}> = T & EventEmitter & {
    remote: ProxyRemote;
};
