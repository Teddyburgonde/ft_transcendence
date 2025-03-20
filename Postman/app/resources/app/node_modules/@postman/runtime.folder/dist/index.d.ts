import { FromSchema } from 'json-schema-to-ts';
import { ItemType } from '@postman/runtime.core';
import Documentation from '@postman/runtime.documentation';
declare const definition: {
    name: "folder";
    summary: "Organize your stuff with hierarchical folders";
    schema: {
        readonly type: "object";
        readonly additionalProperties: false;
    };
    constraints: [{
        constraint: "allow-child-types";
        allowed: ["folder", "ws-raw-request", "ws-socketio-request", "grpc-request", "graphql-request"];
    }, {
        constraint: "allow-extensions";
        allowed: ["documentation"];
    }];
};
declare namespace Folder {
    type Payload = FromSchema<typeof definition.schema>;
    type Extensions = Documentation;
    const use: () => ItemType.Specific<{}, Documentation, unknown, never, never>;
}
type Folder = ItemType.Specific<Folder.Payload, Folder.Extensions>;
export default Folder;
