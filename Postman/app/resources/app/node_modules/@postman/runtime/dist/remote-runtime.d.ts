import { Client } from '@postman/runtime.runtime-rpc';
import { GRPCAgent } from '@postman/runtime.grpc-request';
import CompleteRuntime from './complete-runtime';
export interface RemoteRuntimeConfig {
    client: Client;
    grpcRequest?: {
        resolveSchema?: GRPCAgent['resolveSchema'];
    };
}
export declare function createRemoteRuntime({ client, ...config }: RemoteRuntimeConfig): CompleteRuntime;
