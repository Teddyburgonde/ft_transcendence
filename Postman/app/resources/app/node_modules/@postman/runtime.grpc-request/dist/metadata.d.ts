import GRPCRequest from '.';
export type PostmanMetadata = GRPCRequest.Payload['metadata'];
export type Metadata = ReadonlyArray<Readonly<[string, string | Uint8Array]>>;
export declare function toRawMetadata(metadata: PostmanMetadata): Metadata;
export declare function toItemMetadata(rawMetadata: Metadata): PostmanMetadata;
