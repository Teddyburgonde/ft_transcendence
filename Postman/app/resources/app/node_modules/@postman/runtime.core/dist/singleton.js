"use strict";
/*
    This function takes a class, which should be treated like a singleton, and
    returns a lazy getter function which returns an instance of that class.
    Every time the getter is called, the same instance is returned.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const nothing = Symbol();
function singleton(Class) {
    let instance = nothing;
    return () => {
        if (instance === nothing)
            instance = new Class();
        return instance;
    };
}
exports.default = singleton;
//# sourceMappingURL=singleton.js.map