import { GRPCAgent } from '@postman/runtime.grpc-request';
import CompleteRuntime from './complete-runtime';
export { ServerMethods } from './server-methods';
export interface RuntimeConfig {
    grpcRequest?: {
        resolveSchema?: GRPCAgent['resolveSchema'];
    };
}
export declare function createRuntime(config?: RuntimeConfig): CompleteRuntime;
