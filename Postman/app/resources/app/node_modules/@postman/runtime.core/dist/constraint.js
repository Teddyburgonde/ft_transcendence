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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstraintSchema = void 0;
const z = __importStar(require("zod"));
/*
    Constraints can be applied to ItemTypes to restrict what they can do.
*/
exports.ConstraintSchema = z.discriminatedUnion('constraint', [
    z
        .object({
        constraint: z.literal('allow-extensions'),
        allowed: z.array(z.string()),
    })
        .strict(),
    z
        .object({
        constraint: z.literal('require-extensions'),
        required: z.array(z.string()),
    })
        .strict(),
    z
        .object({
        constraint: z.literal('allow-child-types'),
        allowed: z.array(z.string()),
    })
        .strict(),
    z
        .object({
        constraint: z.literal('block-child-types'),
        blocked: z.array(z.string()),
    })
        .strict(),
    z
        .object({
        constraint: z.literal('limit-children'),
        limit: z.number().int().min(0),
    })
        .strict(),
    z
        .object({
        constraint: z.literal('limit-children-by-type'),
        limits: z.record(z.number().int().min(0)),
    })
        .strict(),
]);
var Constraint;
(function (Constraint) {
    function isConstraint(value) {
        return exports.ConstraintSchema.safeParse(value).success;
    }
    Constraint.isConstraint = isConstraint;
    function asConstraint(value) {
        return exports.ConstraintSchema.parse(value);
    }
    Constraint.asConstraint = asConstraint;
    function isOk(item, constraint) {
        switch (constraint.constraint) {
            case 'allow-extensions':
                for (const extensionName of Object.keys(item.extensions)) {
                    if (!constraint.allowed.includes(extensionName)) {
                        return false;
                    }
                }
                return true;
            case 'require-extensions':
                for (const extensionName of constraint.required) {
                    if (item.extensions[extensionName] === undefined) {
                        return false;
                    }
                }
                return true;
            case 'allow-child-types':
                for (const child of item.children) {
                    if (!constraint.allowed.includes(child.type)) {
                        return false;
                    }
                }
                return true;
            case 'block-child-types':
                for (const child of item.children) {
                    if (constraint.blocked.includes(child.type)) {
                        return false;
                    }
                }
                return true;
            case 'limit-children':
                if (item.children.length > constraint.limit) {
                    return false;
                }
                return true;
            case 'limit-children-by-type':
                for (const [type, limit] of Object.entries(constraint.limits)) {
                    let count = 0;
                    for (const child of item.children) {
                        if (child.type === type)
                            count += 1;
                    }
                    if (count > limit) {
                        return false;
                    }
                }
                return true;
        }
    }
    Constraint.isOk = isOk;
    function typeIsOk(itemType, constraint) {
        switch (constraint.constraint) {
            case 'allow-extensions':
                for (const { extension } of itemType.extensions) {
                    if (!constraint.allowed.includes(extension.name)) {
                        return false;
                    }
                }
                return true;
            case 'require-extensions':
                for (const extensionName of constraint.required) {
                    if (!itemType.extensions.find((x) => x.extension.name === extensionName)) {
                        return false;
                    }
                }
                return true;
            case 'allow-child-types':
            case 'block-child-types':
            case 'limit-children':
            case 'limit-children-by-type':
                return true;
        }
    }
    Constraint.typeIsOk = typeIsOk;
})(Constraint || (Constraint = {}));
exports.default = Constraint;
//# sourceMappingURL=constraint.js.map