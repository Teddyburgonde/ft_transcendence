"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedCore = void 0;
const sdk_core_1 = require("@1password/sdk-core");
/**
 *  An implementation of the `Core` interface that shares resources across all clients.
 */
class SharedCore {
    initClient(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const serializedConfig = JSON.stringify(config);
            return (0, sdk_core_1.init_client)(serializedConfig);
        });
    }
    invoke(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const serializedConfig = JSON.stringify(config);
            return (0, sdk_core_1.invoke)(serializedConfig);
        });
    }
    releaseClient(clientId) {
        const serializedId = JSON.stringify(clientId);
        (0, sdk_core_1.release_client)(serializedId);
    }
}
exports.SharedCore = SharedCore;
