export interface ParsedURL {
    host: string;
    pathname: string;
    isTLS: boolean;
}
export declare function parseURL(str: string): ParsedURL;
