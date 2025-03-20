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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteRuntime = exports.ServerMethods = exports.createRuntime = exports.createRemoteRuntime = void 0;
var remote_runtime_1 = require("./remote-runtime");
Object.defineProperty(exports, "createRemoteRuntime", { enumerable: true, get: function () { return remote_runtime_1.createRemoteRuntime; } });
var runtime_1 = require("./runtime");
Object.defineProperty(exports, "createRuntime", { enumerable: true, get: function () { return runtime_1.createRuntime; } });
var server_methods_1 = require("./server-methods");
Object.defineProperty(exports, "ServerMethods", { enumerable: true, get: function () { return server_methods_1.ServerMethods; } });
var complete_runtime_1 = require("./complete-runtime");
Object.defineProperty(exports, "CompleteRuntime", { enumerable: true, get: function () { return __importDefault(complete_runtime_1).default; } });
__exportStar(require("@postman/runtime.core"), exports);
//# sourceMappingURL=index.js.map