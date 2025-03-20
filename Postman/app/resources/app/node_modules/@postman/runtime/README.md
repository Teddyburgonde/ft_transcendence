# Runtime

This package provides a complete `Runtime`, allowing you to validate and execute Items (and trees of Items) for all ItemTypes supported by Postman.

See [@postman/runtime.core](../core) for more information about the `Runtime` class.

## Node.js usage

```js
import { createRuntime } from '@postman/runtime';

const runtime = createRuntime();
const run = runtime.execItem(myGrpcItem);

for await (const event of run) {
	console.log(event);
}
```

## Browser usage

In the browser, you'll need a RuntimeRPC client to connect to a Runtime server. The RuntimeRPC connection is usually over [WebSockets](../../runtime-rpc/runtime-rpc-ws) or [Electron IPC](../../runtime-rpc/runtime-rpc-electron).

```js
import { createRemoteRuntime } from '@postman/runtime';
import { Client as ElectronClient } from '@postman/runtime.runtime-rpc-electron';
import { Client as WebSocketClient } from '@postman/runtime.runtime-rpc-ws';

let client;
if (/\belectron\//i.test(navigator.userAgent)) {
	client = new ElectronClient('my-ipc-channel-name');
} else {
	client = new WebSocketClient('ws://my-websocket-server.com');
}

const runtime = createRemoteRuntime({ client });
const run = runtime.execItem(myGrpcItem);

for await (const event of run) {
	console.log(event);
}
```

## Setting up a Runtime server over WebSockets

```js
import { Server } from '@postman/runtime.runtime-rpc-ws';
import { ServerMethods } from '@postman/runtime';

const runtimeServer = new Server({ port }, ServerMethods);

runtimeServer.whenListening().then(() => {
  console.log(`listening on port ${runtimeServer.address().port}`);
});
```

## Setting up a Runtime server over Electron IPC

```js
import { Server } from '@postman/runtime.runtime-rpc-electron';
import { ServerMethods } from '@postman/runtime';

const runtimeServer = new Server('my-ipc-channel-name', ServerMethods);
```
