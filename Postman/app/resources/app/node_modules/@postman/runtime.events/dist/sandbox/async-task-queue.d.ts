export default class AsyncQueue {
    private queue;
    private running;
    private isKilled;
    push(task: () => Promise<void>, callback: (e?: unknown) => void): void;
    kill(): void;
    drain(): Promise<unknown>;
    private run;
}
