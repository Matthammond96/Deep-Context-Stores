import { AsyncLocalStorage } from "./async-local-polyfill";

import DeepContextManager from "./context";

export type DeepStoreContext<T extends Record<string, any>> = {
  state: T;
  instanceId: string;
};

const globalContextStore = new AsyncLocalStorage<DeepStoreContext<any>>();

export function createDeepStore<T extends Record<string, any>, R extends any>(
  initialValue: T,
  factory: () => R
): R;

export function createDeepStore<T extends Record<string, any>>(
  initialValue: T
): {
  withStore: <U>(func: (store: DeepStoreContext<T>) => U) => U;
};

export function createDeepStore<T extends Record<string, any>, R extends any>(
  initialValue: T,
  factory?: () => R
): R | { withStore: <U>(func: (store: DeepStoreContext<T>) => U) => U } {
  const instanceId = `store_${Math.random().toString(36).slice(2, 9)}`;
  const context: DeepStoreContext<T> = { state: initialValue, instanceId };

  if (!factory) {
    return {
      withStore: <U>(func: (store: DeepStoreContext<T>) => U): U => {
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

export const getDeepStore = <T extends Record<string, any>>(): T => {
  const contextStore = globalContextStore.getStore();
  if (!contextStore) throw new Error("Failed to retrieve current store.");
  return contextStore.state;
};

export function setDeepStore<T extends Record<string, any>>(
  valueOrUpdater: Partial<T> | ((store: T) => Partial<T> | T) | T
): void {
  const contextStore = globalContextStore.getStore();
  if (!contextStore) throw new Error("Failed to retrieve current store.");

  let newValues: any;
  if (typeof valueOrUpdater === "function") {
    newValues = valueOrUpdater((contextStore as DeepStoreContext<T>).state);
  } else {
    newValues = valueOrUpdater;
  }

  if (typeof newValues === "object" && newValues !== null) {
    Object.assign(contextStore.state, newValues);
  } else if (newValues !== undefined) {
    (contextStore as DeepStoreContext<T>).state = newValues;
  }
}

export const withDeepStoreContext = <T extends Record<string, any>, R>(
  context: DeepStoreContext<T>,
  func: () => R
): R => {
  return globalContextStore.run(context, func);
};

export function useDeepStore<T extends Record<string, any>>(): [
  T,
  (valueOrUpdater: Partial<T> | ((state: T) => Partial<T> | T) | T) => void
] {
  const state = getDeepStore<T>();
  return [state, (valueOrUpdater) => setDeepStore<T>(valueOrUpdater)];
}
