"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basic = void 0;
const js_base64_1 = require("js-base64");
/*
    In order to use the "basic" authentication type, you must implement:
        config.http.setHeader
*/
function basic(get) {
    const key = 'Authorization';
    const value = `Basic ${js_base64_1.Base64.encode(get('username') + ':' + get('password'))}`;
    return [[key, value]];
}
exports.basic = basic;
//# sourceMappingURL=basic.js.map