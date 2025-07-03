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
});
```

## `setDeepStore`

Updates the current store state within the active context.

```ts
setDeepStore<T extends Record<string, any>>(
  valueOrUpdater: Partial<T> | ((state: T) => Partial<T> | T) | T
): void
```

- **`valueOrUpdater`**:
  - An object with properties to merge into the current state,
  - or a function that receives the current state and returns a partial or new state,
  - or a new state object to replace the current state.

#### Example

```ts
type Store = { data: string };

const store = createDeepStore<Store>({ data: "foo" });
store.withStore(() => {
  setDeepStore<Store>({ data: "bar" });
  setDeepStore<Store>((state) => ({ data: state.data + "!" }));
});
```

## `useDeepStore`

A convenience hook that returns the current store state and a setter function, similar to React's `useState`.

```ts
useDeepStore<T extends Record<string, any>>(): [
  T,
  (valueOrUpdater: Partial<T> | ((state: T) => Partial<T> | T) | T) => void
]
```

- **Returns**:
  - The current store state
  - A setter function to update the state (same signature as `setDeepStore`)

#### Example

```ts
type Store = { data: string };

const store = createDeepStore<Store>({ data: "foo" });
store.withStore(() => {
  const [state, setState] = useDeepStore<Store>();
  console.log(state.data); // "foo"
  setState({ data: "baz" });
  setState((s) => ({ data: s.data + "!" }));
});
```
