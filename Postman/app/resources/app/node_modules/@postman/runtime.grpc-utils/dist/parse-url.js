"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseURL = void 0;
/*
    Parses a string URL and validates that it is appropriate for GRPC.
*/
function parseURL(str) {
    str = String(str); // For non-TypeScript applications
    if (!/^[a-z0-9+.-]+:\/\//i.test(str)) {
        str = `grpc://${str}`; // Default protocol
    }
    let url;
    try {
        url = new URL(str);
    }
    catch (_) {
        throw new Error(`Invalid URL "${str}"`);
    }
    if (url.protocol !== 'unix:' &&
        url.protocol !== 'grpc:' &&
        url.protocol !== 'http:' &&
        url.protocol !== 'https:') {
        throw new Error(`Invalid protocol "${url.protocol}//", try "grpc://" instead`);
    }
    return {
        host: url.protocol === 'unix:' ? url.href : url.host,
        pathname: url.protocol === 'unix:' ? '' : url.pathname,
        isTLS: url.protocol === 'https:',
    };
}
exports.parseURL = parseURL;
//# sourceMappingURL=parse-url.js.map