// Browser polyfill for AsyncLocalStorage
class AsyncLocalStoragePolyfill<T> {
  private _store: T | undefined;
  private _contextStack: T[] = [];

  constructor() {
    this._store = undefined;
  }

  /**
   * Returns the current store value
   */
  getStore(): T | undefined {
    return this._store;
  }

  /**
   * Runs a function with a given store context
   */
  run<R>(store: T, callback: () => R): R {
    const previousStore = this._store;
    this._contextStack.push(previousStore as T);
    this._store = store;

    try {
      return callback();
    } finally {
      this._store = this._contextStack.pop();
    }
  }

  /**
   * Enters a new async context (for compatibility)
   */
  enterWith(store: T): void {
    this._store = store;
  }

  /**
   * Disables the instance (clears current store)
   */
  disable(): void {
    this._store = undefined;
    this._contextStack = [];
  }

  /**
   * Exits the current context
   */
  exit<R>(callback: () => R): R {
    const previousStore = this._store;
    this._store = undefined;

    try {
      return callback();
    } finally {
      this._store = previousStore;
    }
  }
}

// Feature detection and polyfill assignment
let AsyncLocalStorage: typeof AsyncLocalStoragePolyfill;

if (typeof window !== "undefined") {
  // Browser environment - use polyfill
  AsyncLocalStorage = AsyncLocalStoragePolyfill;
} else {
  // Node.js environment - use native implementation
  try {
    const { AsyncLocalStorage: NodeAsyncLocalStorage } = require("async_hooks");
    AsyncLocalStorage = NodeAsyncLocalStorage;
  } catch {
    // Fallback to polyfill if async_hooks is not available
    AsyncLocalStorage = AsyncLocalStoragePolyfill;
  }
}

export { AsyncLocalStorage };
