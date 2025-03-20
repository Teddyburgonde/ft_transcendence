import { ParsedURL } from '@postman/runtime.mqtt-utils';
import { tlsOptions } from './client';
export type CustomStreamArgs = {
    parsedURL: ParsedURL;
    tlsOptions?: tlsOptions | null;
};
export declare function customStream(options: CustomStreamArgs): any;
