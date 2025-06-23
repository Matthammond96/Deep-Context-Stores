import { AsyncLocalStorage } from "async_hooks";

import DeepContextManager from "./context.ts";

export type StoreContext<T extends Record<string, any>> = T & {
  instanceId: string;
};

const globalContextStore = new AsyncLocalStorage<StoreContext<any>>();

export function createDeepStore<
  T extends Record<string, any>,
  R extends object
>(initialValue: T, factory: () => R): R;

export function createDeepStore<T extends Record<string, any>>(
  initialValue: T
): {
  withStore: <U>(callback: () => U) => U;
};

export function createDeepStore<
  T extends Record<string, any>,
  R extends object
>(
  initialValue: T,
  factory?: () => R
): R | { withStore: <U>(callback: () => U) => U } {
  const instanceId = `store_${Math.random().toString(36).slice(2, 9)}`;
  const context: StoreContext<T> = { ...initialValue, instanceId };

  if (!factory) {
    return {
      withStore: <U>(callback: () => U): U => {
        const res = globalContextStore.run(context, () => {
          return callback();
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
  callback: () => R
): R => {
  return globalContextStore.run(context, callback);
};
