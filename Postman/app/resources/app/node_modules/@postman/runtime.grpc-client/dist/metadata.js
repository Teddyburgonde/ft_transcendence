"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapMetadata = exports.wrapMetadata = void 0;
const grpc = __importStar(require("@postman/grpc-js"));
/*
    Converts between raw metadata pairs and grpc.Metadata.
*/
function wrapMetadata(rawMetadata) {
    const grpcMetadata = new grpc.Metadata();
    for (const [key, value] of rawMetadata) {
        let result;
        if (key.toLowerCase().endsWith('-bin')) {
            if (!(value instanceof Uint8Array)) {
                throw new TypeError('Metadata ending in "-bin" must be a Uint8Array');
            }
            result = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
        }
        else {
            if (typeof value !== 'string') {
                throw new TypeError('Metadata must be a string');
            }
            result = value;
        }
        grpcMetadata.add(key, result);
    }
    return grpcMetadata;
}
exports.wrapMetadata = wrapMetadata;
function unwrapMetadata(grpcMetadata) {
    const rawMetadata = [];
    for (const [key, values] of Object.entries(grpcMetadata.toJSON())) {
        for (const value of values) {
            rawMetadata.push([key, value]);
        }
    }
    return rawMetadata;
}
exports.unwrapMetadata = unwrapMetadata;
//# sourceMappingURL=metadata.js.map