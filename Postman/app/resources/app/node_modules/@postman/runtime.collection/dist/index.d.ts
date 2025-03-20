import { FromSchema } from 'json-schema-to-ts';
import { ItemType } from '@postman/runtime.core';
import Documentation from '@postman/runtime.documentation';
declare const definition: {
    name: "collection";
    summary: "Save your requests in a collection for reuse and sharing";
    schema: {
        readonly type: "object";
        readonly properties: {
            readonly variables: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: ["key", "value"];
                    readonly properties: {
                        readonly key: {
                            readonly type: "string";
                        };
                        readonly value: {
                            readonly type: "string";
                        };
                        readonly disabled: {
                            readonly type: "boolean";
                        };
                    };
                    readonly additionalProperties: false;
                };
            };
        };
        readonly additionalProperties: false;
    };
    constraints: [{
        constraint: "allow-child-types";
        allowed: ["folder", "ws-raw-request", "ws-socketio-request", "grpc-request", "graphql-request"];
    }, {
        constraint: "allow-extensions";
        allowed: ["documentation"];
    }, {
        constraint: "require-extensions";
        required: ["documentation"];
    }];
};
declare namespace Collection {
    type Payload = FromSchema<typeof definition.schema>;
    type Extensions = Documentation;
    const use: () => ItemType.Specific<{
        variables?: {
            disabled?: boolean | undefined;
            key: string;
            value: string;
        }[] | undefined;
    }, Documentation, unknown, never, never>;
}
type Collection = ItemType.Specific<Collection.Payload, Collection.Extensions>;
export default Collection;
