declare class VariableScope {
    private name?;
    private values;
    private references;
    constructor(definition?: VariableScope.Definition);
    has(name: string): boolean;
    get<T = any>(name: string): T | undefined;
    set<T = any>(name: string, value: T): void;
    unset(name: string): void;
    put(values: VariableScope.Values): void;
    clear(): void;
    toObject(): Record<string, any>;
    toJSON(): VariableScope.Definition;
}
declare namespace VariableScope {
    type Values = Array<{
        key: string;
        value: any;
        disabled?: boolean;
    }>;
    type Definition = {
        name?: string;
        values: Values;
    };
}
export { VariableScope };
