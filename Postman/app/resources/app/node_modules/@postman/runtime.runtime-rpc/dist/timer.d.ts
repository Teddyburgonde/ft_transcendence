export default class Timer {
    private readonly duration;
    private readonly callback;
    private timer;
    constructor(duration: number, callback: () => void);
    reset(): void;
    stop(): void;
}
