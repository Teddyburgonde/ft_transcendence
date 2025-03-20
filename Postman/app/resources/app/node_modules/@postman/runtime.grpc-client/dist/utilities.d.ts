import * as grpc from '@postman/grpc-js';
import { ParsedURL } from '@postman/runtime.grpc-utils';
import { TLSOptions, CallOptions } from './client';
export declare function getChannelCredentials(isTLS: boolean, { rejectUnauthorized, secureContext }: TLSOptions): grpc.ChannelCredentials;
export declare function getClientOptions(parsedURL: ParsedURL, settings: grpc.ChannelOptions | null | undefined): grpc.ClientOptions;
export declare function getCallOptions(options: CallOptions): grpc.CallOptions;
/**
 * Setup proxy by setting 'grpc_proxy' environment variable.
 * @param url - The URL of the proxy server.
 */
export declare function setupProxy(url: string): void;
