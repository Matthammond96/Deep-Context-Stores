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
- **Returns**: An object with a `withStore` method. Use `withStore(callback)` to run a callback with the store context active.

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
