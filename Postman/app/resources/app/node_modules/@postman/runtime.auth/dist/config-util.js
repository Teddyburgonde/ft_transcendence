"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHTTPInterface = void 0;
// Extracts a property of the config's HTTP interface, making sure it exists.
function useHTTPInterface(config, key) {
    const value = config.http?.[key];
    if (value == null) {
        throw new TypeError(`Auth extension configuration is missing "${key}"`);
    }
    return value;
}
exports.useHTTPInterface = useHTTPInterface;
//# sourceMappingURL=config-util.js.map