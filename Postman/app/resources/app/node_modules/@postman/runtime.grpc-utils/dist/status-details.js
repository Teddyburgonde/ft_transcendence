"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapStatusDetails = void 0;
const Protobuf = __importStar(require("@postman/protobufjs"));
const js_base64_1 = require("js-base64");
const status_json_1 = __importDefault(require("../definitions/google/rpc/status.json"));
const error_details_json_1 = __importDefault(require("../definitions/google/rpc/error_details.json"));
const BASE64_RE = /^[a-zA-Z0-9+/=]*\s*$/;
let Status;
function unwrapStatusDetails(metadata) {
    const details = metadata.find((m) => m.key === 'grpc-status-details-bin')?.value;
    if (!details)
        return;
    if (!BASE64_RE.test(details)) {
        throw new Error('Invalid base64 string for "grpc-status-details-bin" key');
    }
    Status = Status ?? loadStatusType();
    if (!Status) {
        throw new Error('Failed to load google.rpc.Status');
    }
    return Status.decode(js_base64_1.Base64.toUint8Array(details)).toJSON();
}
exports.unwrapStatusDetails = unwrapStatusDetails;
function loadStatusType() {
    const root = new Protobuf.Root();
    root.addJSON(status_json_1.default.nested);
    root.addJSON(error_details_json_1.default.nested);
    return root.lookupType('google.rpc.Status');
}
//# sourceMappingURL=status-details.js.map