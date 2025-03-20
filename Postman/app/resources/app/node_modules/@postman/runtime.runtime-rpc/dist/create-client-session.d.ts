import { Initializer } from './types';
export default function createClientSession(initializer: Initializer, options?: {
    timeout?: number;
}): Promise<ClientSession>;
export interface ClientSession {
    invoke<T = any>(methodName: string, params?: object, abortSignal?: AbortSignal): Promise<T>;
    close(): void;
    isOpen(): boolean;
    onClose(fn: () => void): void;
}
