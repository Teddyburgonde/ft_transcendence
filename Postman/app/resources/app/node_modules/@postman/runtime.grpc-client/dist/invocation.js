"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invocation = void 0;
const events_1 = require("events");
const json_bigint_string_1 = __importDefault(require("json-bigint-string"));
const metadata_1 = require("./metadata");
const response_timer_1 = __importDefault(require("./response-timer"));
/*
    Invocation represents an in-flight GRPC method call. It will typically emit
    one "metadata" event (headers), one "status" events (with trailers), and
    either one or N "response" events, depending on the kind of method.

    For "client-stream" and "bidi" methods, you are expected to eventually call
    "end()", after sending some number of messages via "write()".
*/
class Invocation extends events_1.EventEmitter {
    constructor(method, fn, metadata, callOptions, message) {
        super();
        this.kind = method.kind;
        this.validate = method.requestType.validate.bind(method.requestType);
        this.timer = new response_timer_1.default();
        const callback = (err, response) => {
            if (err != null)
                err.metadata || this.emit('error', err);
            else
                this.emit('response', response);
        };
        switch (this.kind) {
            case 'unary':
                if (message === undefined) {
                    throw new TypeError('A message is required for unary methods');
                }
                this.call = fn(message, metadata, callOptions, callback);
                break;
            case 'client-stream':
                this.call = fn(metadata, callOptions, callback);
                if (message !== undefined) {
                    this.call.write(message);
                }
                break;
            case 'server-stream':
                if (message === undefined) {
                    throw new TypeError('A message is required for server-streaming');
                }
                this.call = fn(message, metadata, callOptions);
                break;
            case 'bidi':
                this.call = fn(metadata, callOptions);
                if (message !== undefined) {
                    this.call.write(message);
                }
                break;
        }
        this.timer.begin();
        this.call
            .on('metadata', (metadata) => {
            this.emit('metadata', (0, metadata_1.unwrapMetadata)(metadata));
        })
            .on('status', (status) => {
            this.emit('status', {
                code: status.code,
                message: status.details,
                metadata: (0, metadata_1.unwrapMetadata)(status.metadata),
                timings: { total: this.timer.resolve() },
            });
        })
            .on('data', (response) => {
            this.emit('response', response);
        })
            .on('error', (err) => {
            this.timer.end();
            if (!err.metadata) {
                this.emit('error', err);
            }
        });
    }
    write(json) {
        if (this.kind !== 'client-stream' && this.kind !== 'bidi') {
            throw new TypeError('Cannot stream messages in this type of method');
        }
        if (!this.validate(json)) {
            throw new Error('Message violates its Protobuf type definition');
        }
        const call = this.call;
        if (call.writable) {
            call.write(Object.setPrototypeOf(json_bigint_string_1.default.parse(json), null));
        }
    }
    end() {
        if (this.kind !== 'client-stream' && this.kind !== 'bidi') {
            throw new TypeError('Cannot stream messages in this type of method');
        }
        const call = this.call;
        if (call.writable) {
            call.end();
        }
    }
    cancel() {
        this.call.cancel();
    }
}
exports.Invocation = Invocation;
//# sourceMappingURL=invocation.js.map