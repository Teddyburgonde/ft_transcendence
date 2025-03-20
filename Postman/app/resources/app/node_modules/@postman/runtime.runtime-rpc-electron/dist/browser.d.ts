import { Client as RPCClient } from '@postman/runtime.runtime-rpc';
import { type IpcRenderer } from 'electron';
export interface ElectronClientOptions {
    ipc?: IpcRenderer;
    channel?: string;
}
export declare class Client extends RPCClient {
    private readonly _ipcChannel;
    constructor(options?: ElectronClientOptions);
    get channel(): string;
}
