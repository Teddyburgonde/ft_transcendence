import ProxyState from './proxy-state';
export declare const ATTACH: unique symbol;
export default class ProxyResult<T extends {}> extends ProxyState {
    private _hooks;
    private readonly _target;
    constructor(target: T);
    get target(): T;
    protected _connected(): boolean;
    protected _disconnect(err: Error | undefined): void;
    static [ATTACH]<T extends {}>(proxy: ProxyResult<T>, hooks: ProxyHooks): void;
}
export interface ProxyHooks {
    connected(): boolean;
    disconnect(err: Error | undefined): void;
}
