import { FromSchema } from 'json-schema-to-ts';
import { Event, Extension, Item } from '@postman/runtime.core';
import type { ItemContext } from './sandbox/sandbox-types';
export interface PluginConfiguration {
    supportedListeners: {
        onBefore?: string;
        onEvent?: Record<string, string>;
        onAfter?: string;
    };
    template: Readonly<string>;
    setContext: (prevContext: ItemContext, item: Item, event?: Event) => ItemContext;
}
declare const definition: {
    name: "events";
    summary: "Script hooks for collection execution";
    schema: {
        readonly type: "array";
        readonly items: {
            readonly type: "object";
            readonly required: ["listen"];
            readonly properties: {
                readonly listen: {
                    readonly type: "string";
                };
                readonly script: {
                    readonly type: "object";
                    readonly required: ["exec"];
                    readonly properties: {
                        readonly exec: {
                            readonly type: "string";
                        };
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["text/javascript"];
                        };
                    };
                    readonly additionalProperties: false;
                };
            };
            readonly additionalProperties: false;
        };
    };
};
declare namespace Events {
    type Name = typeof definition.name;
    type Data = FromSchema<typeof definition.schema>;
    type Config = PluginConfiguration;
    const use: () => Extension.Specific<"events", {
        script?: {
            type?: "text/javascript" | undefined;
            exec: string;
        } | undefined;
        listen: string;
    }[], PluginConfiguration>;
}
type Events = Extension.Specific<Events.Name, Events.Data, Events.Config>;
export default Events;
