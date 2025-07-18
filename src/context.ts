import { withDeepStoreContext } from "./store";

export default class DeepContextManager {
  private static boundFunctions = new WeakMap<Function, Function>();
  private static proxyCache = new WeakMap<object, WeakMap<object, object>>();

  static autoBindFunction<T extends Function, S>(fn: T, context: S): T {
    return ((...args: any[]) => {
      return withDeepStoreContext(context as any, () => {
        const result = fn.apply(null, args);
        if (result && typeof result === "object" && !Array.isArray(result)) {
          return this.deepBindObject(result, context);
        }
        return result;
      });
    }) as unknown as T;
  }

  static deepBindObject<T extends object, S>(obj: T, context: S): T {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      return obj;
    }

    const proto = Object.getPrototypeOf(obj);
    if (
      proto !== Object.prototype &&
      proto !== Function.prototype &&
      proto !== null
    ) {
      return obj;
    }

    // Proxy cache per context
    let contextMap = this.proxyCache.get(context as object);
    if (!contextMap) {
      contextMap = new WeakMap();
      this.proxyCache.set(context as object, contextMap);
    }
    if (contextMap.has(obj)) {
      return contextMap.get(obj) as T;
    }

    const proxy = new Proxy(obj, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value === "function") {
          return DeepContextManager.autoBindFunction(value, context);
        }

        if (value && typeof value === "object" && !Array.isArray(value)) {
          return DeepContextManager.deepBindObject(value, context);
        }

        return value;
      },
    });

    contextMap.set(obj, proxy);
    return proxy as T;
  }

  static bindContext<T extends any, S>(obj: T, context: S): T {
    if (!obj || typeof obj !== "object") {
      return obj;
    }
    return this.deepBindObject(obj, context) as T;
  }
}
