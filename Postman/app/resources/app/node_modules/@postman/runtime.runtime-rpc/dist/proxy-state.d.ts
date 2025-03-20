export default abstract class ProxyState {
    private readonly _cleanupCallbacks;
    protected _closed: boolean;
    protected _error: Error | undefined;
    protected abstract _connected(): boolean;
    protected abstract _disconnect(err: Error | undefined): void;
    onCleanup(fn: (err?: Error | undefined) => void): void;
    offCleanup(fn: (err?: Error | undefined) => void): void;
    disconnect(err?: Error | undefined): void;
    get connected(): boolean;
}
