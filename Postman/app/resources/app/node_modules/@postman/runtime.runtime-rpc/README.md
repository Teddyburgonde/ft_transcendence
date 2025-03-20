# runtime-rpc

This package contains a generic (transport-agnostic) implementation of the Runtime-RPC protocol. The Runtime-RPC protocol is used to connect clients with remote runtime servers.

The novel feature of Runtime-RPC is that you can send an arbitrary object from the server to the client, and then the client can actually invoke methods on that object (which execute on the server, asynchronously), as well as receive events that are emitted on the object. In other words, you can model objects within any programming language and then operate them remotely, from a completely unrelated programming enrivonment. Runtime-RPC is specifically designed to efficiently handle event-based architecture (which also enables efficient streaming), and thus this implementation provides built-in support for modelling a Node.js-style [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter).

A complete specification for the Runtime-RPC protocol can be found [here](./docs/spec.md). Note that you don't really need to read the specification unless you plan on creating your own implementation of the protocol (perhaps in different programming language), which this package already provides.

## Usage

Runtime-RPC is a transport-agnostic protocol, and this package does not contain integration with any specific transport layer. In order to use Runtime-RPC in your application, you need to use a wrapper around this package for a specific transport layer of your choosing (e.g., WebSockets, IPC, etc.).

**This package requires a JavaScript environment that supports [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), which includes Node.js v16.x.x or later, or any modern browser.**
