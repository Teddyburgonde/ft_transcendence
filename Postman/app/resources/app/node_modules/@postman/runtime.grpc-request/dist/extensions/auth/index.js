"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    supportedAuthTypes: ['noauth', 'basic', 'bearer', 'apikey'],
    http: {
        setHeader(item, name, value) {
            const { payload } = item;
            payload.metadata = payload.metadata.filter((x) => x.key !== name);
            if (value !== undefined) {
                payload.metadata.push({ key: name, value });
            }
        },
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map