import { Item } from '@postman/runtime.core';
import Auth from '..';
export declare function hawk(get: (key: string) => string, config: Auth.Config, item: Item): Promise<[string, string][]>;
