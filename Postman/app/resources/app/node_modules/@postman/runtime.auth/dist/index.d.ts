import { FromSchema } from 'json-schema-to-ts';
import { Extension, Item } from '@postman/runtime.core';
export interface PluginConfiguration {
    supportedAuthTypes: ReadonlyArray<'noauth' | 'awsv4' | 'basic' | 'bearer' | 'hawk' | 'oauth1' | 'oauth2' | 'apikey' | 'edgegrid'>;
    http?: {
        getURL?: (item: Item) => string;
        getMethod?: (item: Item) => string;
        getBody?: (item: Item) => Uint8Array | Promise<Uint8Array>;
        getHeader?: (item: Item, name: string) => string | undefined;
        setHeader?: (item: Item, name: string, value: string | undefined) => void;
    };
}
declare const definition: {
    name: "auth";
    summary: "Security credentials";
    schema: {
        readonly type: "object";
        readonly required: ["type"];
        readonly properties: {
            readonly type: {
                readonly type: "string";
                readonly enum: readonly ["noauth", "awsv4", "basic", "bearer", "hawk", "oauth1", "oauth2", "apikey", "edgegrid"];
            };
            readonly awsv4: {
                readonly $ref: "#/definitions/key-value-pairs";
            };
            readonly basic: {
                readonly $ref: "#/definitions/key-value-pairs";
            };
            readonly bearer: {
                readonly $ref: "#/definitions/key-value-pairs";
            };
            readonly hawk: {
                readonly $ref: "#/definitions/key-value-pairs";
            };
            readonly oauth1: {
                readonly $ref: "#/definitions/key-value-pairs";
            };
            readonly oauth2: {
                readonly $ref: "#/definitions/key-value-pairs";
            };
            readonly apikey: {
                readonly $ref: "#/definitions/key-value-pairs";
            };
            readonly edgegrid: {
                readonly $ref: "#/definitions/key-value-pairs";
            };
        };
        readonly additionalProperties: false;
        readonly definitions: {
            readonly 'key-value-pairs': {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: ["key", "value"];
                    readonly properties: {
                        readonly key: {
                            readonly type: "string";
                        };
                        readonly value: {};
                    };
                    readonly additionalProperties: false;
                };
            };
        };
    };
};
declare namespace Auth {
    type Name = typeof definition.name;
    type Data = FromSchema<typeof definition.schema>;
    type Config = PluginConfiguration;
    const use: () => Extension.Specific<"auth", {
        awsv4?: {
            key: string;
            value: unknown;
        }[] | undefined;
        basic?: {
            key: string;
            value: unknown;
        }[] | undefined;
        bearer?: {
            key: string;
            value: unknown;
        }[] | undefined;
        hawk?: {
            key: string;
            value: unknown;
        }[] | undefined;
        oauth1?: {
            key: string;
            value: unknown;
        }[] | undefined;
        oauth2?: {
            key: string;
            value: unknown;
        }[] | undefined;
        apikey?: {
            key: string;
            value: unknown;
        }[] | undefined;
        edgegrid?: {
            key: string;
            value: unknown;
        }[] | undefined;
        type: "noauth" | "awsv4" | "basic" | "bearer" | "hawk" | "oauth1" | "oauth2" | "apikey" | "edgegrid";
    }, PluginConfiguration>;
}
type Auth = Extension.Specific<Auth.Name, Auth.Data, Auth.Config>;
export default Auth;
