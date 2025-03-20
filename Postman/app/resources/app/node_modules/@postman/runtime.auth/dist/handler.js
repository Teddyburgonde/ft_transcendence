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
const config_util_1 = require("./config-util");
const authTypes = __importStar(require("./auth-types"));
exports.default = (function handler(itemType) {
    const { config } = itemType.getExtension('auth');
    const { supportedAuthTypes } = config;
    return {
        async onBefore(item) {
            const auth = item.extensions.auth;
            if (!auth) {
                return;
            }
            if (!supportedAuthTypes.includes(auth.type)) {
                throw new Error(`Unsupported auth type: "${auth.type}"`);
            }
            if (auth.type === 'noauth') {
                return;
            }
            const authSettings = auth[auth.type] ?? [];
            const getter = get.bind(null, authSettings);
            let results;
            switch (auth.type) {
                case 'basic':
                    results = authTypes.basic(getter);
                    break;
                case 'bearer':
                    results = authTypes.bearer(getter);
                    break;
                case 'apikey':
                    results = authTypes.apikey(getter);
                    break;
                case 'awsv4':
                    results = authTypes.awsv4();
                    break;
                case 'hawk':
                    results = await authTypes.hawk(getter, config, item);
                    break;
                case 'oauth1':
                    results = authTypes.oauth1();
                    break;
                case 'oauth2':
                    results = authTypes.oauth2();
                    break;
                case 'edgegrid':
                    results = authTypes.edgegrid();
                    break;
            }
            if (results.length) {
                const setHeader = (0, config_util_1.useHTTPInterface)(config, 'setHeader');
                for (const [key, value] of results) {
                    setHeader(item, key, value);
                }
            }
            return item;
        },
    };
});
// Case-insensitive key-value getter, always casts to string.
function get(kvPairs, key) {
    key = key.toLowerCase();
    const value = kvPairs.find((x) => x.key.toLowerCase() === key)?.value;
    return value == null ? '' : String(value);
}
//# sourceMappingURL=handler.js.map