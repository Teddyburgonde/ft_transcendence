"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneDescriptor = void 0;
const protobufjs_1 = __importDefault(require("@postman/protobufjs"));
const definition_1 = require("./definition");
const descriptors_1 = require("./descriptors");
// Given a Protobuf descriptor, this generates a new descriptor that only
// contains the entities that are required by the given method. This method
// always returns the descriptor in parsed JSON format.
function pruneDescriptor(descriptor, methodPath) {
    const jsonDescriptor = (0, descriptors_1.toJSONDescriptor)(descriptor);
    const definition = new definition_1.Definition(jsonDescriptor);
    const method = definition.methods.get(methodPath);
    if (!method) {
        throw new Error(`Method "${methodPath}" does not exist`);
    }
    // Recursively traverse Type/Enum references reachable from the Method node,
    // and remember each reachable entity's path from the root namespace.
    const paths = new Set(['.' + methodPath]);
    function visit(node) {
        if (node instanceof protobufjs_1.default.Enum) {
            paths.add(node.fullName);
        }
        else if (node instanceof protobufjs_1.default.Type) {
            if (!paths.has(node.fullName)) {
                paths.add(node.fullName);
                node.fieldsArray
                    .concat(...node.oneofsArray.map((oneof) => oneof.fieldsArray))
                    .forEach((field) => {
                    if (field.declaringField) {
                        paths.add(field.declaringField.fullName);
                    }
                    if (field.map) {
                        visit(field.resolvedKeyType);
                    }
                    visit(field.resolvedType);
                });
            }
        }
        else if (node != null) {
            console.warn(`Unrecognized Protobuf class: ${node && node.constructor.name}`);
        }
    }
    visit(method.requestType.astNode);
    visit(method.responseType.astNode);
    // Make a clone of the JSON descriptor, but with only the relevant paths.
    const prunedDescriptor = traverseAndPluck(jsonDescriptor, 
    // Split each string path into an array, trimming the leading ".".
    Array.from(paths).map((x) => x.split('.').slice(1)));
    // Make sure the method descriptor is valid, with no missing references.
    try {
        protobufjs_1.default.Root.fromJSON(prunedDescriptor).resolveAll();
    }
    catch (err) {
        throw new Error(`Unable to generate pruned method descriptor for "${methodPath}":\n` +
            JSON.stringify(jsonDescriptor, null, 4) +
            '\n\n' +
            `Original stack trace:\n${err.stack}`);
    }
    return prunedDescriptor;
}
exports.pruneDescriptor = pruneDescriptor;
// Clones a Protobuf JSON descriptor, with only the relevant key paths.
function traverseAndPluck(namespaceObject, paths, isItselfRelevant = false) {
    // Prevent mutations on the original object.
    namespaceObject = { ...namespaceObject };
    if (namespaceObject.nested || namespaceObject.methods) {
        if (namespaceObject.nested) {
            namespaceObject.nested = pluck(namespaceObject.nested, paths);
        }
        if (namespaceObject.methods) {
            namespaceObject.methods = pluck(namespaceObject.methods, paths);
        }
        // If this namespace is only relevant due to it containing relevant
        // children, then we must strip its fields, so they don't cause
        // false-positive "missing reference" errors.
        if (!isItselfRelevant) {
            if (namespaceObject.fields) {
                namespaceObject.fields = {};
            }
            if (namespaceObject.oneofs) {
                namespaceObject.oneofs = {};
            }
        }
    }
    return namespaceObject;
}
// Repeated logic used by traverseAndPluck().
function pluck(obj, paths) {
    const relevantKeys = new Map();
    for (const [key, ...childPath] of paths) {
        if (relevantKeys.has(key)) {
            relevantKeys.get(key).push(childPath);
        }
        else {
            relevantKeys.set(key, [childPath]);
        }
    }
    const plucked = {};
    for (const key of Object.keys(obj)) {
        if (relevantKeys.has(key)) {
            const childPathsRaw = relevantKeys.get(key);
            const childPaths = childPathsRaw.filter((path) => path.length);
            const isItselfRelevant = childPathsRaw.some((path) => !path.length);
            plucked[key] = traverseAndPluck(obj[key], childPaths, isItselfRelevant);
        }
    }
    return plucked;
}
//# sourceMappingURL=prune-descriptor.js.map