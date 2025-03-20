import * as Protobuf from '@postman/protobufjs';
export type MethodKind = 'unary' | 'client-stream' | 'server-stream' | 'bidi';
export declare class Definition {
    readonly methods: ReadonlyMap<string, Method>;
    constructor(descriptor: unknown);
}
export declare class Method {
    readonly name: string;
    readonly comment: string | null;
    readonly kind: MethodKind;
    readonly requestType: Type;
    readonly responseType: Type;
    constructor(node: Protobuf.Method);
}
export declare class Type {
    readonly name: string;
    readonly comment: string | null;
    readonly astNode: Protobuf.Type;
    private _jsonSchema;
    constructor(node: Protobuf.Type);
    get jsonSchema(): any;
    validate(json: string): boolean;
}
