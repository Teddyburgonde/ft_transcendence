import { Initializer, MethodHandler } from './types';
export default function createServerSession(initializer: Initializer, rpcMethods: Record<string, MethodHandler>, options?: {
    heartbeat?: {
        interval?: number;
        tries?: number;
    };
}): Promise<ServerSession>;
export interface ServerSession {
    close(): void;
    onClose(fn: () => void): void;
}
