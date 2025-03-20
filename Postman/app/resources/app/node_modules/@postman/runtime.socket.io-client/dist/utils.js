"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeErrorMessage = exports.parseHeaders = exports.parseUrl = void 0;
function parseUrl(str) {
    str = String(str); // For non-TypeScript applications
    // Test if the string doesn't start with a protocol
    if (!/^[a-z0-9+.-]+:\/\//i.test(str)) {
        str = `ws://${str}`; // Default protocol
    }
    const url = new URL(str);
    if (!url.host && !url.port && !url.pathname) {
        throw new Error('Invalid URL');
    }
    const validProtocols = ['ws:', 'wss:', 'http:', 'https:'];
    if (!validProtocols.includes(url.protocol)) {
        throw new Error('Invalid URL');
    }
    return url;
}
exports.parseUrl = parseUrl;
function parseHeaders(headerString) {
    let arr = headerString.split('\r\n'), headers = [];
    for (let i = 1, ii = arr.length - 2; i < ii; i++) {
        const splitIndex = arr[i].indexOf(':');
        headers.push({
            key: arr[i].slice(0, splitIndex),
            value: arr[i].slice(splitIndex + 2),
        });
    }
    return headers;
}
exports.parseHeaders = parseHeaders;
function serializeErrorMessage(error, clientVersion) {
    if (String(error?.message).includes('v2.x with a v3.x')) {
        return `It seems you are trying to reach a Socket.IO server in v2.x with a v${clientVersion}.x client. Switch the client version from request settings.`;
    }
    return error?.description?.error?.message ?? error?.message;
}
exports.serializeErrorMessage = serializeErrorMessage;
//# sourceMappingURL=utils.js.map