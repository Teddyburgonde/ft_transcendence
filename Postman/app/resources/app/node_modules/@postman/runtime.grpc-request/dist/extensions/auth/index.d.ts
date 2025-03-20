import { Item } from '@postman/runtime.core';
declare const config: {
    supportedAuthTypes: ("basic" | "bearer" | "apikey" | "noauth")[];
    http: {
        setHeader(item: Item, name: string, value: string | undefined): void;
    };
};
export default config;
