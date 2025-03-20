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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const grpc = __importStar(require("@postman/grpc-js"));
const ProtoLoader = __importStar(require("@postman/proto-loader"));
const get_1 = __importDefault(require("lodash/get"));
const json_bigint_string_1 = __importDefault(require("json-bigint-string"));
const runtime_grpc_utils_1 = require("@postman/runtime.grpc-utils");
const runtime_grpc_utils_2 = require("@postman/runtime.grpc-utils");
const utilities_1 = require("./utilities");
const metadata_1 = require("./metadata");
const invocation_1 = require("./invocation");
/*
    A Client is instantiated from a Protobuf descriptor, and is capable
    of invoking all methods defined within the descriptor.
*/
class Client {
    constructor(options) {
        const parsedURL = (0, runtime_grpc_utils_2.parseURL)(options.url);
        const jsonDescriptor = (0, runtime_grpc_utils_2.toJSONDescriptor)(options.descriptor);
        const definition = new runtime_grpc_utils_1.Definition(jsonDescriptor);
        // These options are used to instantiate each Service.
        const clientOptions = (0, utilities_1.getClientOptions)(parsedURL, options.channelOptions);
        const channelCredentials = (0, utilities_1.getChannelCredentials)(Boolean(parsedURL.isTLS || options.tlsOptions), options.tlsOptions || {});
        if (options.proxy) {
            (0, utilities_1.setupProxy)(options.proxy);
        }
        const hierarchy = grpc.loadPackageDefinition(ProtoLoader.fromJSON(jsonDescriptor, {
            ...PROTOBUF_OPTIONS,
            defaults: Boolean(options.includeDefaultFields),
        }));
        // Extract each method, instantiating each Service in the process.
        const methods = new Map();
        const services = new Map();
        for (const [methodPath, methodDefinition] of definition.methods) {
            const keyPath = methodPath.split('.');
            const methodName = keyPath.pop() || '';
            const servicePath = keyPath.join('.');
            let service = services.get(servicePath);
            if (!service) {
                const Service = (0, get_1.default)(hierarchy, keyPath);
                if (typeof Service !== 'function' ||
                    typeof Service.serviceName !== 'string') {
                    throw new TypeError(`Failed to find gRPC service: "${servicePath}"`);
                }
                service = new Service(parsedURL.host, channelCredentials, clientOptions);
                services.set(servicePath, service);
            }
            const fn = service[methodName];
            if (typeof fn !== 'function') {
                throw new TypeError(`Failed to find gRPC method: "${methodPath}"`);
            }
            methods.set(methodPath, { def: methodDefinition, fn: fn.bind(service) });
        }
        this.methods = methods;
    }
    invoke(method, options = {}) {
        const methodInfo = this.methods.get(method);
        if (!methodInfo) {
            throw new Error(`Method "${method}" does not exist`);
        }
        let message;
        if (options.message != null) {
            if (!methodInfo.def.requestType.validate(options.message)) {
                throw new Error('Message violates its Protobuf type definition');
            }
            message = Object.setPrototypeOf(json_bigint_string_1.default.parse(options.message), null);
        }
        return new invocation_1.Invocation(methodInfo.def, methodInfo.fn, (0, metadata_1.wrapMetadata)(options.metadata || []), (0, utilities_1.getCallOptions)(options.callOptions || {}), message);
    }
}
exports.Client = Client;
const PROTOBUF_OPTIONS = {
    keepCase: true,
    alternateCommentMode: true,
    json: true,
    enums: String,
    bytes: String,
    longs: String,
};
//# sourceMappingURL=client.js.map