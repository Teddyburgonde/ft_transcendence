import { io as io_v4 } from 'socket.io-client-v4';
export declare class SocketIOClientFactory {
    static getClient(version: '2' | '3' | '4'): typeof io_v4;
}
