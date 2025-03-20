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
exports.setupProxy = exports.getCallOptions = exports.getClientOptions = exports.getChannelCredentials = void 0;
const tls = __importStar(require("tls"));
const grpc = __importStar(require("@postman/grpc-js"));
// Generates customized ChannelCredentials.
function getChannelCredentials(isTLS, { rejectUnauthorized, secureContext }) {
    if (!isTLS) {
        return grpc.credentials.createInsecure();
    }
    if (!(secureContext instanceof tls.SecureContext)) {
        const { ca, ...options } = secureContext || {};
        secureContext = tls.createSecureContext(options);
        if (ca)
            secureContext.context.addCACert(ca);
    }
    const channelCreds = grpc.credentials.createFromSecureContext(secureContext);
    channelCreds.connectionOptions.rejectUnauthorized = !!rejectUnauthorized;
    return channelCreds;
}
exports.getChannelCredentials = getChannelCredentials;
// Generates ClientOptions with support for URL pathnames.
function getClientOptions(parsedURL, settings) {
    return {
        ...settings,
        channelFactoryOverride: (address, credentials, options) => {
            if (parsedURL.pathname && parsedURL.pathname !== '/') {
                return new PathAwareChannel(parsedURL.host, credentials, options, parsedURL.pathname);
            }
            return new grpc.Channel(address, credentials, options);
        },
    };
}
exports.getClientOptions = getClientOptions;
function getCallOptions(options) {
    const callOptions = {};
    if ('deadline' in options) {
        callOptions.deadline = options.deadline;
    }
    else if ('connectionTimeout' in options && options.connectionTimeout) {
        if (typeof options.connectionTimeout !== 'number') {
            throw new TypeError('Invalid connection timeout. Must be a number.');
        }
        callOptions.deadline = Date.now() + options.connectionTimeout;
    }
    return callOptions;
}
exports.getCallOptions = getCallOptions;
/**
 * Setup proxy by setting 'grpc_proxy' environment variable.
 * @param url - The URL of the proxy server.
 */
function setupProxy(url) {
    process.env.grpc_proxy = url;
}
exports.setupProxy = setupProxy;
class PathAwareChannel extends grpc.Channel {
    constructor(target, credentials, options, _prefix) {
        super(target, credentials, options);
        this._prefix = _prefix;
    }
    createCall(method, ...args) {
        return super.createCall(`${this._prefix}${method}`, ...args);
    }
}
//# sourceMappingURL=utilities.js.map