"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sandbox_template_1 = __importDefault(require("./sandbox-template"));
const execution_context_1 = __importDefault(require("./execution-context"));
const config = {
    supportedListeners: {
        onBefore: 'beforeInvoke',
        onEvent: {
            status: 'afterResponse',
        },
    },
    template: sandbox_template_1.default,
    setContext: execution_context_1.default,
};
exports.default = config;
//# sourceMappingURL=index.js.map