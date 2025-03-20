import { ClientOptions, InvokeOptions } from './client';
import { Invocation } from './invocation';
export * from './invocation';
export * from './client';
export interface ShorthandInvokeOptions extends ClientOptions, InvokeOptions {
    method: string;
}
export declare function invoke(options: ShorthandInvokeOptions): Invocation;
