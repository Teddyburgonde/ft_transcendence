import { FromSchema } from 'json-schema-to-ts';
import { Extension } from '@postman/runtime.core';
export interface PluginConfiguration {
}
declare const definition: {
    name: "documentation";
    summary: "Document your items";
    schema: {
        readonly type: "object";
        readonly required: ["content"];
        readonly properties: {
            readonly content: {
                readonly type: "string";
            };
            readonly summary: {
                readonly type: "string";
                readonly maxLength: 140;
            };
        };
        readonly additionalProperties: false;
    };
};
declare namespace Documentation {
    type Name = typeof definition.name;
    type Data = FromSchema<typeof definition.schema>;
    type Config = PluginConfiguration;
    const use: () => Extension.Specific<"documentation", {
        summary?: string | undefined;
        content: string;
    }, PluginConfiguration>;
}
type Documentation = Extension.Specific<Documentation.Name, Documentation.Data, Documentation.Config>;
export default Documentation;
