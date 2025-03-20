"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
const runtime_core_1 = require("@postman/runtime.core");
const handler_1 = __importDefault(require("./handler"));
const definition = (0, json_schema_to_ts_1.asConst)({
    name: 'variables',
    summary: 'Customize your requests with variables',
    schema: {
        type: 'object',
        additionalProperties: false,
    },
});
var Variables;
(function (Variables) {
    Variables.use = runtime_core_1.Extension.define(definition, handler_1.default);
})(Variables || (Variables = {}));
exports.default = Variables;
//# sourceMappingURL=index.js.map