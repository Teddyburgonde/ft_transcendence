import Schema from '@postman/runtime.schema';
import { SecureContextOptions } from '@postman/runtime.core';
import { Metadata } from './metadata';
export interface GRPCAgent {
    invoke(options: InvokeOptions): GRPCInvocation | Promise<GRPCInvocation>;
    resolveSchema(schema: Schema.Data, options: ResolveOptions): unknown | Promise<unknown>;
}
export interface GRPCInvocation {
    write(json: string): void | Promise<void>;
    end(): void | Promise<void>;
    cancel(): void | Promise<void>;
    on(eventName: 'response', listener: (response: any) => void): this;
    on(eventName: 'metadata', listener: (metadata: Metadata) => void): this;
    on(eventName: 'status', listener: (status: Status) => void): this;
    on(eventName: 'error', listener: (error: unknown) => void): this;
}
export interface Status {
    code: number;
    message: string;
    metadata: Metadata;
    timings: {
        total: number;
    };
}
export interface InvokeOptions {
    url: string;
    descriptor: unknown;
    method: string;
    metadata: Metadata;
    message?: string;
    includeDefaultFields: boolean;
    channelOptions: ChannelOptions;
    callOptions: CallOptions;
    tlsOptions?: TLSOptions;
    proxy?: string;
}
export interface ResolveOptions {
    url: string;
    metadata: Metadata;
    channelOptions: ChannelOptions;
    callOptions: CallOptions;
    tlsOptions?: TLSOptions;
    proxy?: string;
}
export interface ChannelOptions {
    'grpc.ssl_target_name_override'?: string;
    'grpc.primary_user_agent'?: string;
    'grpc.secondary_user_agent'?: string;
    'grpc.default_authority'?: string;
    'grpc.keepalive_time_ms'?: number;
    'grpc.keepalive_timeout_ms'?: number;
    'grpc.keepalive_permit_without_calls'?: number;
    'grpc.service_config'?: string;
    'grpc.max_concurrent_streams'?: number;
    'grpc.initial_reconnect_backoff_ms'?: number;
    'grpc.max_reconnect_backoff_ms'?: number;
    'grpc.use_local_subchannel_pool'?: number;
    'grpc.max_send_message_length'?: number;
    'grpc.max_receive_message_length'?: number;
    'grpc.enable_http_proxy'?: number;
    'grpc.http_connect_target'?: string;
    'grpc.http_connect_creds'?: string;
    'grpc.default_compression_algorithm'?: 0 | 1 | 2;
    'grpc.enable_channelz'?: number;
    'grpc.dns_min_time_between_resolutions_ms'?: number;
    'grpc.enable_retries'?: number;
    'grpc.per_rpc_retry_buffer_size'?: number;
    'grpc.retry_buffer_size'?: number;
    'grpc.max_connection_age_ms'?: number;
    'grpc.max_connection_age_grace_ms'?: number;
    'grpc-node.max_session_memory'?: number;
    'grpc.service_config_disable_resolution'?: number;
    'grpc.client_idle_timeout_ms'?: number;
}
export type CallOptions = {
    connectionTimeout?: number;
};
export interface TLSOptions {
    rejectUnauthorized?: boolean;
    secureContext?: SecureContextOptions;
}
export type { SecureContextOptions };
