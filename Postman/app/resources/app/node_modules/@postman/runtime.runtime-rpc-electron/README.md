# runtime-rpc-electron

This package contains an Electron-specific (IPC) implementation of the [Runtime-RPC protocol](../runtime-rpc/), for communicating between Electron's renderer and main processes.

This package exposes the `Client` and `Server` classes for browser-like environments and Node.js respectively.

## Example

Client:

```ts
import { createRemoteRuntime } from '@postman/runtime'
import { Client } from '@postman/runtime.runtime-rpc-electron';
import { ipcRenderer } from 'electron';

function connect(ipc = ipcRenderer) {
  const client = new Client({ ipc });
  const runtime = createRemoteRuntime({ client });

  // ...
}
```

Server:

```ts
import { Server } from '@postman/runtime.runtime-rpc-electron';
import { ServerMethods } from '@postman/runtime';
import { ipcMain } from 'electron';

function connect(ipc = ipcMain) {
  const server = new Server(ServerMethods, { ipc });
}
```
