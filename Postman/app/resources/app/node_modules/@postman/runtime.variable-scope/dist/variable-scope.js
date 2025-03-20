"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableScope = void 0;
const lodash_1 = require("lodash");
/*
    A VariableScope is a simple container for key-value pairs.
*/
class VariableScope {
    constructor(definition = { values: [] }) {
        this.name = definition.name;
        this.put(definition.values);
    }
    has(name) {
        return name in this.references;
    }
    get(name) {
        return this.references[name];
    }
    set(name, value) {
        if (this.has(name)) {
            for (let i = this.values.length - 1; i >= 0; i--) {
                if (this.values[i].key === name) {
                    this.values[i].value = value;
                    break;
                }
            }
        }
        else {
            this.values.push({ key: name, value });
        }
        this.references[name] = value;
    }
    unset(name) {
        this.values = this.values.filter((value) => value.key !== name);
        delete this.references[name];
    }
    put(values) {
        this.values =
            Array.isArray(values) ?
                (0, lodash_1.cloneDeep)(values.filter((v) => typeof v.key === 'string' && !v.disabled))
                : [];
        this.references = this.values.reduce((acc, v) => {
            acc[v.key] = v.value;
            return acc;
        }, Object.create(null));
    }
    clear() {
        this.values = [];
        this.references = Object.create(null);
    }
    toObject() {
        return (0, lodash_1.cloneDeep)(this.references);
    }
    toJSON() {
        return {
            name: this.name,
            values: (0, lodash_1.cloneDeep)(this.values),
        };
    }
}
exports.VariableScope = VariableScope;
//# sourceMappingURL=variable-scope.js.map