export default function createAsyncIterator<T>(initializer: (write: (value: T) => void) => Promise<void>): AsyncIterableIterator<T>;
