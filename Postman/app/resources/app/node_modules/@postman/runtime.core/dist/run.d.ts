import { EventChannel, Event } from '@postman/runtime.event-channel';
import { Runtime, RuntimeContextCore } from './runtime';
import Item from './item';
export declare const impls: unique symbol;
export default class Run {
    private readonly runtime;
    private readonly queue;
    readonly events: EventChannel.Any;
    private readonly context;
    private currentTask;
    private currentPosition;
    private isPaused;
    constructor(runtime: Runtime, context: RuntimeContextCore, queue: ReadonlyArray<Item>, startPaused: boolean);
    private execItem;
    resume(): void;
    pause(): Promise<void>;
    cancel(): void;
    get done(): boolean;
    get paused(): boolean;
    get waitingToPause(): boolean;
    [Symbol.asyncIterator](): AsyncIterator<Event>;
}
