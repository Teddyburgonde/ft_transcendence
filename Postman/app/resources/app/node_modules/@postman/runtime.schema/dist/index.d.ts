import { FromSchema } from 'json-schema-to-ts';
import { Extension } from '@postman/runtime.core';
export interface PluginConfiguration {
}
declare const definition: {
    name: "schema";
    summary: "An associated schema";
    schema: {
        readonly type: "object";
        readonly oneOf: [{
            readonly required: ["source"];
            readonly properties: {
                readonly source: {
                    readonly type: "string";
                    readonly const: "none";
                };
            };
            readonly additionalProperties: false;
        }, {
            readonly required: ["source"];
            readonly properties: {
                readonly source: {
                    readonly type: "string";
                    readonly const: "auto";
                };
            };
            readonly additionalProperties: false;
        }, {
            readonly required: ["source", "apiId", "versionId"];
            readonly properties: {
                readonly source: {
                    readonly type: "string";
                    readonly const: "api";
                };
                readonly apiId: {
                    readonly type: "string";
                };
                readonly versionId: {
                    readonly type: "string";
                };
                readonly releaseId: {
                    readonly type: "string";
                };
            };
            readonly additionalProperties: false;
        }];
    };
};
declare namespace Schema {
    type Name = typeof definition.name;
    type Data = FromSchema<typeof definition.schema>;
    type Config = PluginConfiguration;
    const use: () => Extension.Specific<"schema", {
        source: "none";
    } | {
        source: "auto";
    } | {
        releaseId?: string | undefined;
        source: "api";
        apiId: string;
        versionId: string;
    }, PluginConfiguration>;
}
type Schema = Extension.Specific<Schema.Name, Schema.Data, Schema.Config>;
export default Schema;
