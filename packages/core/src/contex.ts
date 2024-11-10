import { AsyncLocalStorage } from "node:async_hooks";

export function createContext<T>(name: string) {
  const storage = new AsyncLocalStorage<T>();
  return {
    use() {
      const result = storage.getStore();
      if (!result) {
        throw new Error(`No context available for ${name}`);
      }
      return result;
    },
    with<R>(value: T, fn: () => R) {
      return storage.run<R>(value, fn);
    },
  };
}
