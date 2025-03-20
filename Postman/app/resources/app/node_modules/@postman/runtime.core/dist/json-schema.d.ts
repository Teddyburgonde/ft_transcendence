export type Validator<T> = (value: unknown) => value is T;
export declare function compile<T = unknown>(schema: unknown): Validator<T>;
export declare function compileCode(schema: unknown): string;
