interface Event<N extends string = string, T = unknown> {
    type: N;
    timestamp: string;
    payload: T;
}
declare class EventChannel<Sent extends Event = never, Received extends Event = never> {
    private isClosed;
    private peer;
    private eventQueue;
    private eventHandlers;
    private cleanupCallbacks;
    private receive;
    get closed(): boolean;
    on<N extends Received['type']>(eventType: N, callback: (event: Received & {
        type: N;
    }) => void): this;
    off<N extends Received['type']>(eventType: N, callback: (event: Received & {
        type: N;
    }) => void): this;
    onAll(callback: (event: Received) => void): this;
    offAll(callback: (event: Received) => void): this;
    onCleanup(callback: () => void): this;
    offCleanup(callback: () => void): this;
    send(event: Sent): void;
    emit<N extends Sent['type']>(eventType: N, payload: (Sent & {
        type: N;
    })['payload']): void;
    emitSelf<N extends Received['type']>(eventType: N, payload: (Received & {
        type: N;
    })['payload']): Promise<void>;
    close(): void;
    link(peer: EventChannel<Received, Sent>): void;
    unlink(peer: EventChannel<Received, Sent>): void;
}
declare namespace Event {
    type Any = Event<string, any>;
}
declare namespace EventChannel {
    type Any = EventChannel<Event.Any, Event.Any>;
    function specific<S extends Event, R extends Event>(channel: EventChannel.Any): EventChannel<S, R>;
}
export { Event, EventChannel };
