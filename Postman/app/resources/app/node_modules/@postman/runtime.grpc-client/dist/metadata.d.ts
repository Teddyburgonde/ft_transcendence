import * as grpc from '@postman/grpc-js';
import { Metadata } from './client';
export declare function wrapMetadata(rawMetadata: Metadata): grpc.Metadata;
export declare function unwrapMetadata(grpcMetadata: grpc.Metadata): Metadata;
