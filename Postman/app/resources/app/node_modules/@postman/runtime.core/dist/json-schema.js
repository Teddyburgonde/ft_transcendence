"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileCode = exports.compile = void 0;
const json_schema_draft_06_json_1 = __importDefault(require("ajv/dist/refs/json-schema-draft-06.json"));
const json_schema_draft_07_json_1 = __importDefault(require("ajv/dist/refs/json-schema-draft-07.json"));
const _2019_1 = __importDefault(require("ajv/dist/2019"));
const standalone_1 = __importDefault(require("ajv/dist/standalone"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const ajv = new _2019_1.default({
    strictTypes: true,
    strictTuples: true,
    allowUnionTypes: true,
    useDefaults: true,
    addUsedSchema: false, // Since we never discard the ajv instance, this would be a memory leak
    inlineRefs: false, // Prevent super-linear memory usage
    code: { source: true }, // This is needed for standalone code generation
});
ajv.addMetaSchema(json_schema_draft_06_json_1.default);
ajv.addMetaSchema(json_schema_draft_07_json_1.default);
(0, ajv_formats_1.default)(ajv);
function compile(schema) {
    const validator = ajv.compile(schema);
    delete validator.source; // Source is only needed for standalone code generation
    return validator;
}
exports.compile = compile;
function compileCode(schema) {
    const validator = ajv.compile(schema);
    return (0, standalone_1.default)(ajv, validator);
}
exports.compileCode = compileCode;
//# sourceMappingURL=json-schema.js.map