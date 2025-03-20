export default function parseMessage(buffer: Uint8Array, requests: Map<number, unknown>, proxies: Map<number, unknown>): Message | null;
export type Message = {
    op: 'req';
    id: number;
    method: string;
    data: Record<string, unknown>;
} | {
    op: 'res';
    id: number;
    data: Record<string, unknown>;
} | {
    op: 'res';
    id: number;
    error: Error;
} | {
    op: 'preq';
    pid: number;
    id: number;
    method: string;
    data: unknown[];
} | {
    op: 'pres';
    id: number;
    data: unknown;
} | {
    op: 'pres';
    id: number;
    error: Error;
} | {
    op: 'pevent';
    pid: number;
    event: string;
    data: unknown[];
} | {
    op: 'pclose';
    pid: number;
    error?: Error;
} | {
    op: 'cancel';
    id: number;
} | {
    op: 'hi';
};
