/// <reference lib="dom" />
import { Connection } from './connection';
import { RPCData, RPCId } from './message';
export type RPC<API = Record<string, RPCCall>> = API & {
    $client: Client;
};
export type RPCCall = (data?: RPCData, options?: {
    signal?: AbortSignal;
}) => Promise<RPCData | undefined>;
export type RPCMethod = (data: RPCData | null | undefined, options: {
    signal: AbortSignal;
}) => undefined | null | RPCData | PromiseLike<undefined | null | RPCData>;
/**
 * Create an RPC proxy interface with the given connection
 *
 * @example
 * ```ts
 * import { rpc } from '...';
 *
 * interface API {
 *   sayHello(data: { name: string }): Promise<{ greeting: string }>;
 * }
 *
 * const connection = ...
 * const api = rpc<API>(connection);
 *
 * const { greeting } = await api.sayHello({ name: '...' });
 * ```
 * @param {Connection} connection
 */
export declare function rpc<RemoteAPI = Record<string, RPCCall>>(connection: Connection): RPC<RemoteAPI>;
export declare class Client {
    #private;
    readonly connection: Connection;
    constructor(connection: Connection);
    call(method: string, data: RPCData | undefined, options?: {
        signal?: AbortSignal;
    }): Promise<RPCData | null | undefined>;
    cancel(id: RPCId, reason: Error): void;
}
export declare class Server {
    #private;
    readonly connection: Connection;
    readonly methods: Record<string, RPCMethod>;
    constructor(connection: Connection, methods: Record<string, RPCMethod>);
    call(id: RPCId, method: string, data?: RPCData | null): void;
    cancel(id: RPCId): void;
    close(): void;
}
