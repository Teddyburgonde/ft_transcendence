import { VariableScope } from './variable-scope';
export default class Variables {
    private readonly scopes;
    constructor(...scopes: ReadonlyArray<VariableScope>);
    has(name: string): boolean;
    get<T = any>(name: string): T | undefined;
    set<T = any>(name: string, value: T): void;
    unset(name: string): void;
    clear(): void;
    toObject(): Record<string, any>;
    replaceIn<T = any>(template: T): T;
}
