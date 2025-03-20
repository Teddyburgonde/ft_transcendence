import { ItemContext } from './sandbox-types';
import type Events from '..';
import { type RuntimeContext } from '@postman/runtime.core';
export declare function getSandbox(runContext: RuntimeContext): Promise<SandboxClient>;
declare class SandboxClient {
    private readonly runContext;
    private sandboxFleet;
    private asyncScriptError;
    private source;
    private readonly queue;
    private readonly cleanups;
    private readonly idGenerator;
    constructor(runContext: RuntimeContext);
    init(): Promise<this>;
    register(templateName: string, template: string): void;
    execute(templateName: string, event: Events.Data[number], itemContext: ItemContext): Promise<void>;
    waitForCompletion(): Promise<void>;
    private get isStopped();
    private getContext;
    private emit;
    private attachListeners;
    private removeListeners;
    private _execute;
    private dispose;
}
export {};
