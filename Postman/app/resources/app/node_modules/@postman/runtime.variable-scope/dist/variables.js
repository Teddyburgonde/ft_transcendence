"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    The Variables class provides access to multiple VariableScopes, such that
    the first scope has the highest priority, and the last scope has the lowest
    priority. Mutation methods such as set(), unset(), and clear() only affect
    the first scope, which is typically used for "local" variables.
*/
class Variables {
    constructor(...scopes) {
        this.scopes = [...scopes];
    }
    has(name) {
        for (const scope of this.scopes) {
            if (scope.has(name))
                return true;
        }
        return false;
    }
    get(name) {
        for (const scope of this.scopes) {
            if (scope.has(name))
                return scope.get(name);
        }
        return undefined;
    }
    set(name, value) {
        const firstScope = this.scopes[0];
        if (firstScope) {
            firstScope.set(name, value);
        }
    }
    unset(name) {
        const firstScope = this.scopes[0];
        if (firstScope) {
            firstScope.unset(name);
        }
    }
    clear() {
        const firstScope = this.scopes[0];
        if (firstScope) {
            firstScope.clear();
        }
    }
    toObject() {
        const objs = this.scopes.map((scope) => scope.toObject()).reverse();
        return Object.assign({}, ...objs);
    }
    // This method is modeled after:
    // https://github.com/postmanlabs/postman-collection/blob/d9bea02202a6e845b37b8cbf456054d8adb1e66f/lib/collection/variable-scope.js#L302
    replaceIn(template) {
        if (Array.isArray(template)) {
            return template.map((x) => this.replaceIn(x));
        }
        if (isPlainObject(template)) {
            const obj = {};
            for (const [key, value] of Object.entries(template)) {
                obj[key] = this.replaceIn(value);
            }
            return obj;
        }
        if (typeof template === 'string' && template !== '') {
            return replaceVariables(template, this);
        }
        return template;
    }
}
exports.default = Variables;
/*
    Variable replacement is an iterative/recursive procedure, so variable values
    may reference other variables. An arbitrary iteration limit is enforced to
    prevent infinite loops.
*/
const VARIABLES_REGEX = /\{\{([^{}]*?)}}/g;
const MAX_ITERATIONS = 19;
function replaceVariables(template, variables) {
    let didReplace = false;
    let iterations = 0;
    const replacer = (match, token) => {
        let result = variables.get(token);
        if (typeof result === 'function') {
            result = result();
        }
        if (result != null && typeof result.toString === 'function') {
            result = result.toString();
        }
        switch (typeof result) {
            case 'string':
                didReplace = true;
                return result;
            case 'number':
            case 'bigint':
            case 'boolean':
                didReplace = true;
                return String(result);
            default:
                // Other types are ignored:
                // https://github.com/postmanlabs/postman-collection/blob/d9bea02202a6e845b37b8cbf456054d8adb1e66f/lib/superstring/index.js#L230
                return match;
        }
    };
    do {
        didReplace = false;
        template = template.replace(VARIABLES_REGEX, replacer);
    } while (didReplace && ++iterations < MAX_ITERATIONS);
    return template;
}
function isPlainObject(value) {
    if (typeof value === 'object' && value !== null) {
        const proto = Object.getPrototypeOf(value);
        if (proto === null) {
            return true;
        }
        if (Object.getPrototypeOf(proto) === null &&
            {}.hasOwnProperty.call(proto, 'hasOwnProperty')) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=variables.js.map