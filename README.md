# Deep-Context-Stores

Creates a new deep context store for managing scoped state and context propagation.

## `createDeepStore`

### 1. With-Store Mode

```ts
createDeepStore<T extends Record<string, any>>(
  initialValue: T
): { withStore: <U>(callback: () => U) => U }
```

- **`initialValue`**: The initial state for the store (object).
- **Returns**: An object with a `withStore` method. Use `withStore(func)` to run a callback with the store context active.

#### Example

```ts
type Store = { data: string };

const store = createDeepStore({ data: "foo" });
store.withStore(() => {
  console.log(getDeepStore<Store>().data); // "food"
});
```

### 1. Factory Mode

```ts
createDeepStore<T extends Record<string, any>, R extends object>(
  initialValue: T,
  factory: () => R
): R
```

- **`initialValue`**: The initial state for the store (object).
- **`factory`**: A function that will be called with the store context active. Use [`getDeepStore`](index.ts) inside the factory to access the current store.
- **Returns**: The result of the factory, with all returned objects and functions deeply bound to the store context.

#### Example

```ts
type Store = { data: string };

function clientFactory() {
  const store = getDeepStore<Store>();
  return {
    data: store.data,
    nested: () => `nested ${getDeepStore<Store>().data}`,
  };
}

const client = createDeepStore({ data: "bar" }, clientFactory);
console.log(client.data); // bar
console.log(client.nested()); // bar
```

See also: [`getDeepStore`](index.ts), [`withDeepStoreContext`](index.ts)

## `getDeepStore`

Retrieves the current active store context within the current execution scope.

```ts
getDeepStore<T extends Record<string, any>>(): StoreContext<T>
```

- **Returns**: The current store context object, including all properties from your initial value and an `instanceId` string.
- **Throws**: If called outside of a store context, throws an error.

Use this function inside a `factory` or within a `withStore` callback to access the current store’s state.

#### Example

```ts
type Store = { data: string };

const store = createDeepStore({ data: "foo" });
store.withStore(() => {
  const ctx = getDeepStore<Store>();
  console.log(ctx.data); // "foo"
  console.log(ctx.instanceId); // e.g. "store_abcd123"
});
```

## `withDeepStoreContext`

Runs a function within the scope of a provided store context. This allows you to re-activate a specific store context that might have previously been lost. Common causes of this is creating new objects outside of the stores context that has adjacent stores defined.

```ts
withDeepStoreContext<T extends Record<string, any>, R>(
  context: StoreContext<T>,
  func: () => R
): R
```

- **`context`**: The store context object to activate (must include all properties from your initial value and an `instanceId`).
- **`func`**: A function to execute with the given context active.
- **Returns**: The result of the callback.

Use this to run code as if it were inside a specific store context, even if called from outside or from another context.

#### Example

```ts
type Store = { data: string };

const store = createDeepStore({ data: "foo" });
store.withStore(() => {
  const ctx = getDeepStore<Store>();
  withDeepStoreContext(ctx, () => {
    console.log(getDeepStore<Store>().data); // "foo"
  });
});
```
