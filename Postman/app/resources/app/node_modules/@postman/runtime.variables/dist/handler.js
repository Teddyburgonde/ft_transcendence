"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function handler(itemType, context) {
    const { config } = itemType.getExtension('variables');
    const { replaceInFields } = config;
    function replace(obj, key) {
        obj[key] = context.variables.replaceIn(obj[key]);
    }
    return {
        async onBefore(item) {
            const keyPaths = replaceInFields
                .map((str) => str.replace(/^\./, '').split('.'))
                .filter((keyPath) => keyPath.length);
            for (const keyPath of keyPaths) {
                const lastKey = keyPath.pop();
                keyPath
                    .reduce((arr, key) => arr.flatMap(mapKeys(get, key)).filter(isNotNull), [item])
                    .forEach(mapKeys(replace, lastKey));
            }
        },
    };
});
// Calls the given function for each matching key within the given object.
// A given key of "*" represents all keys within an object, and a given key of
// "[]" represents all indexes within an array. All other keys are interpreted
// literally. The result of each function call is returned within an array.
function mapKeys(fn, key) {
    return (obj) => {
        if (key === '[]') {
            if (Array.isArray(obj)) {
                return obj.map((_, i, arr) => fn(arr, i));
            }
        }
        else if (key === '*') {
            if (!Array.isArray(obj)) {
                return Object.keys(obj).map((realKey) => fn(obj, realKey));
            }
        }
        else {
            if ({}.hasOwnProperty.call(obj, key)) {
                return [fn(obj, key)];
            }
        }
        return [];
    };
}
function isNotNull(value) {
    return value != null;
}
function get(obj, key) {
    return obj[key];
}
//# sourceMappingURL=handler.js.map