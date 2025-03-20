/// <reference types="node" />
export declare function parseUrl(str: string): URL;
type Header = {
    key: string;
    value: string;
};
export declare function parseHeaders(headerString: string): Header[];
export declare function serializeErrorMessage(error: any, clientVersion: string): string;
export {};
