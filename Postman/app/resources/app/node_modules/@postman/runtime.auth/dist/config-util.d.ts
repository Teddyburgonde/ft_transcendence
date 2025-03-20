import Auth from '.';
type HTTPInterface = NonNullable<Auth.Config['http']>;
export declare function useHTTPInterface<K extends keyof HTTPInterface>(config: Auth.Config, key: K): NonNullable<HTTPInterface[K]>;
export {};
