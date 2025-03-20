"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUrl = void 0;
function isValidUrl(str) {
    str = String(str); // For non-TypeScript applications
    // Test if the string doesn't start with a protocol
    if (!/^[a-z0-9+.-]+:\/\//i.test(str)) {
        str = `ws://${str}`; // Default protocol
    }
    let url;
    try {
        url = new URL(str);
    }
    catch (_) {
        return false;
    }
    if (!url.host && !url.port && !url.pathname) {
        return false;
    }
    const validProtocols = ['ws:', 'wss:'];
    if (!validProtocols.includes(url.protocol)) {
        return false;
    }
    return true;
}
exports.isValidUrl = isValidUrl;
//# sourceMappingURL=utils.js.map