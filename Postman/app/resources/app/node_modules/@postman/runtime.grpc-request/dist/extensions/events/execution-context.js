"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_grpc_utils_1 = require("@postman/runtime.grpc-utils");
exports.default = (prevContext = {}, item, event) => {
    const { payload, extensions } = item;
    const receivedEvent = event;
    const itemContext = {
        request: { ...prevContext.request },
        response: { ...prevContext.response },
    };
    if (prevContext.request === undefined) {
        const definition = new runtime_grpc_utils_1.Definition(payload.methodDescriptor);
        const methodKind = definition.methods.get(payload.methodPath)?.kind;
        itemContext.request = {
            id: item.id,
            name: item.title,
            url: payload.url,
            auth: extensions.auth,
            metadata: payload.metadata,
            methodPath: payload.methodPath,
            messages: methodKind === 'unary' || methodKind === 'server-stream' ?
                [{ data: payload.message }]
                : [],
        };
    }
    switch (receivedEvent?.type) {
        case 'sent-request-header':
            itemContext.request = {
                ...prevContext.request,
                // Update request context to have resolved values
                url: payload.url,
                auth: extensions.auth,
                metadata: payload.metadata,
            };
            break;
        case 'sent-request-data':
            const prevMessage = prevContext.request?.messages ?? [];
            itemContext.request.messages = [...prevMessage];
            if (prevMessage.length === 1 && !prevMessage[0].timestamp) {
                itemContext.request.messages = [];
            }
            itemContext.request.messages.push({
                data: receivedEvent.payload.data,
                timestamp: receivedEvent.timestamp,
            });
            break;
        case 'received-response-header':
            itemContext.response.metadata = receivedEvent.payload.metadata;
            break;
        case 'received-response-data':
            itemContext.response.messages = [
                ...(prevContext.response?.messages ?? []),
            ];
            itemContext.response.messages.push({
                data: receivedEvent.payload.data,
                timestamp: receivedEvent.timestamp,
            });
            break;
        case 'status':
            itemContext.response.statusCode = receivedEvent.payload.statusCode;
            itemContext.response.trailers = receivedEvent.payload.metadata;
            const responseTime = receivedEvent.payload.timings?.total;
            itemContext.response.responseTime =
                typeof responseTime === 'number' ? Math.ceil(responseTime) : undefined;
            break;
    }
    return itemContext;
};
//# sourceMappingURL=execution-context.js.map