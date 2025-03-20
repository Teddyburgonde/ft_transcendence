"use strict";
/*
    In order to use the "bearer" authentication type, you must implement:
        config.http.setHeader
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.bearer = void 0;
function bearer(get) {
    const key = 'Authorization';
    const value = `Bearer ${get('token')}`;
    return [[key, value]];
}
exports.bearer = bearer;
//# sourceMappingURL=bearer.js.map