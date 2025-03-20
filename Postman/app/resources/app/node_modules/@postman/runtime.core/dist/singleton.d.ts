export default function singleton<T>(Class: new () => T): () => T;
