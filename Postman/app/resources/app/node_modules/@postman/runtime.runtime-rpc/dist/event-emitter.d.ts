export declare const EVENTS: unique symbol;
export type EventListener = (...args: any[]) => void;
export default class EventEmitter {
    private [EVENTS];
    emit(event: string, ...args: any[]): boolean;
    addListener(event: string, listener: EventListener): this;
    removeListener(event: string, listener: EventListener): this;
    on(event: string, listener: EventListener): this;
    off(event: string, listener: EventListener): this;
}
