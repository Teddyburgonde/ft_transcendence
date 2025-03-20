"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hawk = void 0;
const postman_url_encoder_1 = __importDefault(require("postman-url-encoder"));
const create_hmac_1 = __importDefault(require("create-hmac"));
const create_hash_1 = __importDefault(require("create-hash"));
const config_util_1 = require("../config-util");
/*
    In order to use the "hawk" authentication type, you must implement:
        config.http.getURL
        config.http.getMethod
        config.http.getBody
        config.http.getHeader
        config.http.setHeader
*/
async function hawk(get, config, item) {
    const getURL = (0, config_util_1.useHTTPInterface)(config, 'getURL').bind(null, item);
    const getMethod = (0, config_util_1.useHTTPInterface)(config, 'getMethod').bind(null, item);
    const getBody = (0, config_util_1.useHTTPInterface)(config, 'getBody').bind(null, item);
    const getHeader = (0, config_util_1.useHTTPInterface)(config, 'getHeader').bind(null, item);
    const authId = get('authId');
    const authKey = get('authKey');
    if (!authId || !authKey) {
        return [];
    }
    const algorithm = get('algorithm');
    if (algorithm !== 'sha1' && algorithm !== 'sha256') {
        throw new Error(`Unsupported Hawk hashing algorithm: "${algorithm}"`);
    }
    let hash = '';
    if (get('includePayloadHash') === 'true') {
        hash = calculatePayloadHash(algorithm, getHeader('content-type') || '', await getBody());
    }
    const parsedURL = postman_url_encoder_1.default.toNodeUrl(getURL());
    const port = parsedURL.port || defaultPorts.get(parsedURL.protocol) || 443;
    const timestamp = Math.max(0, Number.parseInt(get('timestamp'), 10)) ||
        Math.floor(Date.now() / 1e3);
    const headerValue = calculateHeader({
        id: authId,
        key: authKey,
        algorithm,
    }, {
        ts: String(timestamp),
        nonce: get('nonce') || randomString(6),
        ext: get('extraData'),
        app: get('app'),
        dlg: get('delegation'),
        hash,
    }, {
        method: getMethod().toUpperCase(),
        resource: (parsedURL.pathname || '') + (parsedURL.search || ''),
        host: (parsedURL.hostname || '').toLowerCase(),
        port: String(port),
    });
    return [['Authorization', headerValue]];
}
exports.hawk = hawk;
// Calculates a Hawk request's Authorization header.
function calculateHeader(credentials, artifacts, target) {
    const attributes = [
        `Hawk id="${credentials.id}"`,
        `ts="${artifacts.ts}"`,
        `nonce="${artifacts.nonce}"`,
        `mac="${calculateMac(credentials, artifacts, target)}"`,
    ];
    if (artifacts.hash) {
        attributes.push(`hash="${artifacts.hash}"`);
    }
    if (artifacts.ext) {
        const ext = artifacts.ext.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        attributes.push(`ext="${ext}"`);
    }
    if (artifacts.app) {
        attributes.push(`app="${artifacts.app}"`);
        artifacts.dlg && attributes.push(`dlg="${artifacts.dlg}"`);
    }
    return attributes.join(', ');
}
// Calculates a Hawk request's MAC digest.
function calculateMac(credentials, artifacts, target) {
    const lines = [
        'hawk.1.header',
        artifacts.ts,
        artifacts.nonce,
        target.method,
        target.resource,
        target.host,
        target.port,
        artifacts.hash,
        artifacts.ext.replace(/\\/g, '\\\\').replace(/\n/g, '\\n'),
    ];
    if (artifacts.app) {
        lines.push(artifacts.app);
        lines.push(artifacts.dlg);
    }
    return (0, create_hmac_1.default)(credentials.algorithm, credentials.key)
        .update(lines.map((str) => str + '\n').join(''))
        .digest('base64');
}
// Calculates a Hawk request's payload hash. Payload should be UTF-8 encoded.
function calculatePayloadHash(algorithm, contentType, payload) {
    return (0, create_hash_1.default)(algorithm)
        .update('hawk.1.payload')
        .update('\n')
        .update(contentType.split(';')[0].trim().toLowerCase())
        .update('\n')
        .update(payload)
        .update('\n')
        .digest('base64');
}
// Returns a random alpha-numeric ASCII string of the given length.
function randomString(length) {
    const TBL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const chars = [];
    for (let i = 0; i < length; ++i) {
        chars.push(TBL[(Math.random() * TBL.length) | 0]);
    }
    return chars.join('');
}
// Table of well-known default port numbers.
const defaultPorts = new Map([
    ['http:', 80],
    ['https:', 443],
    ['ws:', 80],
    ['wss:', 443],
]);
//# sourceMappingURL=hawk.js.map