export interface HTTPRequest {
    method: 'GET' | 'CONNECT';
    href: string;
    headers: Array<{
        key: string;
        value: string;
    }>;
    httpVersion: string;
}
export interface HTTPResponse {
    statusCode: number;
    statusMessage: string;
    headers: Array<{
        key: string;
        value: string;
    }>;
    httpVersion: string;
}
export interface ConnectionEndEvent {
    code?: number;
    reason?: string;
    aborted: boolean;
}
export interface ErrorEvent {
    error: {
        message: string;
    };
    handshakeRequest?: HTTPRequest;
    handshakeResponse?: HTTPResponse;
}
export interface MessageEvent {
    message: string | Uint8Array;
}
export interface OpenEvent {
    request?: HTTPRequest;
    response?: HTTPResponse;
}
export interface ReconnectEvent {
    attempt: number;
    timeout: number;
}
export interface UpgradeEvent {
    request?: HTTPRequest;
    response?: HTTPResponse;
}
export interface CloseEvent {
    aborted?: boolean;
    code: number;
    reason: string;
}
