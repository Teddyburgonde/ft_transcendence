import { z } from 'zod';
export declare const RPCId: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
export type RPCId = z.infer<typeof RPCId>;
export declare const RPCData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export type RPCData = z.infer<typeof RPCData>;
export declare const RPCRequest: z.ZodObject<{
    op: z.ZodLiteral<"req">;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    method: z.ZodString;
    data: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    context: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    op: "req";
    id: string | number;
    method: string;
    data?: Record<string, unknown> | null | undefined;
    context?: Record<string, unknown> | null | undefined;
}, {
    op: "req";
    id: string | number;
    method: string;
    data?: Record<string, unknown> | null | undefined;
    context?: Record<string, unknown> | null | undefined;
}>;
export type RPCRequest = z.infer<typeof RPCRequest>;
export declare const RPCResponse: z.ZodObject<{
    op: z.ZodLiteral<"res">;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    data: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    error: z.ZodUnknown;
    context: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    op: "res";
    id: string | number;
    data?: Record<string, unknown> | null | undefined;
    error?: unknown;
    context?: Record<string, unknown> | null | undefined;
}, {
    op: "res";
    id: string | number;
    data?: Record<string, unknown> | null | undefined;
    error?: unknown;
    context?: Record<string, unknown> | null | undefined;
}>;
export type RPCResponse = z.infer<typeof RPCResponse>;
export declare const RPCCancel: z.ZodObject<{
    op: z.ZodLiteral<"cancel">;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    context: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    op: "cancel";
    id: string | number;
    context?: Record<string, unknown> | null | undefined;
}, {
    op: "cancel";
    id: string | number;
    context?: Record<string, unknown> | null | undefined;
}>;
export type RPCCancel = z.infer<typeof RPCCancel>;
export declare const RPCHeartbeat: z.ZodObject<{
    op: z.ZodLiteral<"hi">;
    context: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    op: "hi";
    context?: Record<string, unknown> | null | undefined;
}, {
    op: "hi";
    context?: Record<string, unknown> | null | undefined;
}>;
export type RPCHeartbeat = z.infer<typeof RPCHeartbeat>;
export declare const RPCMessage: z.ZodDiscriminatedUnion<"op", [z.ZodObject<{
    op: z.ZodLiteral<"req">;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    method: z.ZodString;
    data: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    context: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    op: "req";
    id: string | number;
    method: string;
    data?: Record<string, unknown> | null | undefined;
    context?: Record<string, unknown> | null | undefined;
}, {
    op: "req";
    id: string | number;
    method: string;
    data?: Record<string, unknown> | null | undefined;
    context?: Record<string, unknown> | null | undefined;
}>, z.ZodObject<{
    op: z.ZodLiteral<"res">;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    data: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    error: z.ZodUnknown;
    context: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    op: "res";
    id: string | number;
    data?: Record<string, unknown> | null | undefined;
    error?: unknown;
    context?: Record<string, unknown> | null | undefined;
}, {
    op: "res";
    id: string | number;
    data?: Record<string, unknown> | null | undefined;
    error?: unknown;
    context?: Record<string, unknown> | null | undefined;
}>, z.ZodObject<{
    op: z.ZodLiteral<"cancel">;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    context: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    op: "cancel";
    id: string | number;
    context?: Record<string, unknown> | null | undefined;
}, {
    op: "cancel";
    id: string | number;
    context?: Record<string, unknown> | null | undefined;
}>, z.ZodObject<{
    op: z.ZodLiteral<"hi">;
    context: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    op: "hi";
    context?: Record<string, unknown> | null | undefined;
}, {
    op: "hi";
    context?: Record<string, unknown> | null | undefined;
}>]> & {
    encode(message: RPCMessage): Uint8Array;
    decode(data: ArrayBuffer | Uint8Array): RPCMessage;
};
export type RPCMessage = RPCRequest | RPCResponse | RPCCancel | RPCHeartbeat;
export declare const messages: {
    request(id: RPCId, method: string, data?: RPCData): RPCRequest;
    success(id: RPCId, data?: RPCData | null): RPCResponse;
    failure(id: RPCId, error: unknown): RPCResponse;
    cancel(id: RPCId): RPCCancel;
    heartbeat(): RPCHeartbeat;
};
