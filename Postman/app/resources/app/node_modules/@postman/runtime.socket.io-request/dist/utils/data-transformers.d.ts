export interface KeyValueItem {
    key?: string | null;
    value?: string | null;
    disabled?: boolean;
}
export declare function transformKVItemToObject(items: KeyValueItem[]): Record<string, string>;
