"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_to_ts_1 = require("json-schema-to-ts");
const runtime_core_1 = require("@postman/runtime.core");
const runtime_documentation_1 = __importDefault(require("@postman/runtime.documentation"));
const definition = (0, json_schema_to_ts_1.asConst)({
    name: 'folder',
    summary: 'Organize your stuff with hierarchical folders',
    schema: {
        type: 'object',
        additionalProperties: false,
    },
    constraints: [
        {
            constraint: 'allow-child-types',
            allowed: [
                'folder',
                'ws-raw-request',
                'ws-socketio-request',
                'grpc-request',
                'graphql-request',
            ],
        },
        {
            constraint: 'allow-extensions',
            allowed: ['documentation'],
        },
    ],
});
const extensions = [runtime_documentation_1.default.use().implement({})];
var Folder;
(function (Folder) {
    Folder.use = runtime_core_1.ItemType.define(definition, extensions);
})(Folder || (Folder = {}));
exports.default = Folder;
//# sourceMappingURL=index.js.map