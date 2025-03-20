"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
function RequestResponseEmitterMixin(Superclass) {
    return class extends Superclass {
        createConnection(...args) {
            // @ts-ignore Ignore the error caused due to ill-defined types for agents
            const socket = super.createConnection(...args);
            socket.on('lookup', () => {
                const req = socket._httpMessage;
                const request = {
                    method: req.method,
                    href: `${req.agent.protocol}//${req.host}${req.path}`,
                    headers: Object.entries(JSON.parse(JSON.stringify(req.getHeaders()))).map(([key, value]) => ({ key, value: value.toString() })),
                    httpVersion: '1.1',
                };
                this.emit('request-meta', request);
            });
            socket.once('data', (chunk) => {
                const res = chunk.toString(), [_, httpVersion, statusCode, statusMessage = ''] = /^HTTP\/(\d.\d) (\d{3})( .*)?/.exec(res) || [];
                if (statusCode) {
                    const response = {
                        statusCode: parseInt(statusCode),
                        statusMessage: statusMessage.substring(1),
                        headers: (0, utils_1.parseHeaders)(res),
                        httpVersion: httpVersion,
                    };
                    this.emit('response-meta', response);
                }
            });
            return socket;
        }
    };
}
exports.default = RequestResponseEmitterMixin;
//# sourceMappingURL=RequestResponseEmitterMixin.js.map