export declare enum MessageType {
    TEXT = "text",
    POSTMAN_JSON = "postman_json",
    JSON = "json",
    XML = "xml",
    HTML = "html",
    BINARY = "binary"
}
export declare enum MessageSubType {
    BASE64 = "base64",
    HEX = "hex"
}
export declare const MIME_TYPE_MAP: Record<MessageType, string>;
