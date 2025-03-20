import { FromSchema } from 'json-schema-to-ts';
import { Extension } from '@postman/runtime.core';
export interface PluginConfiguration {
    replaceInFields: ReadonlyArray<string>;
}
declare const definition: {
    name: "variables";
    summary: "Customize your requests with variables";
    schema: {
        readonly type: "object";
        readonly additionalProperties: false;
    };
};
declare namespace Variables {
    type Name = typeof definition.name;
    type Data = FromSchema<typeof definition.schema>;
    type Config = PluginConfiguration;
    const use: () => Extension.Specific<"variables", {}, PluginConfiguration>;
}
type Variables = Extension.Specific<Variables.Name, Variables.Data, Variables.Config>;
export default Variables;
