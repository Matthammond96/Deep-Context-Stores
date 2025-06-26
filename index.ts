import { AsyncLocalStorage } from "./async-local-polyfill";

import DeepContextManager from "./context";

export type StoreContext<T extends Record<string, any>> = T & {
  instanceId: string;
};

const globalContextStore = new AsyncLocalStorage<StoreContext<any>>();

export function createDeepStore<T extends Record<string, any>, R extends any>(
  initialValue: T,
  factory: () => R
): R;

export function createDeepStore<T extends Record<string, any>>(
  initialValue: T
): {
  withStore: <U>(func: (store: StoreContext<T>) => U) => U;
};

export function createDeepStore<T extends Record<string, any>, R extends any>(
  initialValue: T,
  factory?: () => R
): R | { withStore: <U>(func: (store: StoreContext<T>) => U) => U } {
  const instanceId = `store_${Math.random().toString(36).slice(2, 9)}`;
  const context: StoreContext<T> = { ...initialValue, instanceId };

  if (!factory) {
    return {
      withStore: <U>(func: (store: StoreContext<T>) => U): U => {
        const res = globalContextStore.run(context, () => {
          return func(context);
        });
        return typeof res === "object" && res !== null
          ? DeepContextManager.bindContext(res, context)
          : res;
      },
    };
  }

  return globalContextStore.run(context, () => {
    const factoryResult = factory();
    return DeepContextManager.bindContext(factoryResult, context);
  });
}

export const getDeepStore = <
  T extends Record<string, any>
>(): StoreContext<T> => {
  const contextStore = globalContextStore.getStore();
  if (!contextStore) throw new Error("Failed to retrieve current store.");
  return contextStore;
};

export const withDeepStoreContext = <T extends Record<string, any>, R>(
  context: StoreContext<T>,
  func: () => R
): R => {
  return globalContextStore.run(context, func);
};
