export interface Deferred {
    promise: Promise<void>;
    resolve(): void;
    reject(err: any): void;
}
export declare function createDeferrred(timeout: number): Deferred;
