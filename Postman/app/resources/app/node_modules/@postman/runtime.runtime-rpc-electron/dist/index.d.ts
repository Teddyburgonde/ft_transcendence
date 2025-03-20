import { type IpcMain } from 'electron';
import { MethodHandler } from '@postman/runtime.runtime-rpc';
export { MethodHandler, MethodContext, SessionData } from '@postman/runtime.runtime-rpc';
export interface ElectronOptions {
    ipc?: IpcMain;
    channel?: string;
}
export declare class Server {
    private _closed;
    private readonly _ipc;
    private readonly _ipcChannel;
    private readonly _ipcListener;
    private readonly _rpcSessions;
    private readonly _rpcServer;
    constructor(rpcMethods: Record<string, MethodHandler>, options?: ElectronOptions);
    close(): void;
    get channel(): string;
    get size(): number;
    get closed(): boolean;
    private static createIPCListener;
    private static registerSession;
}
