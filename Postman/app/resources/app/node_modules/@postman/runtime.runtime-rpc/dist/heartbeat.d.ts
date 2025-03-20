export default class Heartbeat {
    private countdown;
    private timer;
    constructor(interval: number, tries: number, callback: (failure: boolean) => void);
    reset(): void;
    stop(): void;
}
