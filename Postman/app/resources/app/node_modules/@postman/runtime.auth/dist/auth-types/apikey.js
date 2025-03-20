"use strict";
/*
    In order to use the "apikey" authentication type, you must implement:
        config.http.setHeader
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.apikey = void 0;
function apikey(get) {
    const key = get('key').trim();
    const value = get('value');
    if (!key) {
        throw new Error('Invalid "API Key" auth has an empty key');
    }
    return [[key, value]];
}
exports.apikey = apikey;
//# sourceMappingURL=apikey.js.map