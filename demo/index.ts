import {
  createDeepStore,
  getDeepStore,
  setDeepStore,
  useDeepStore,
} from "../index.ts";

type Store = {
  data: string;
};

export function factory() {
  const [store, setStore] = useDeepStore<{ data: string }>();
  return {
    getData() {
      return getDeepStore<Store>().data;
    },
    nestedFactory: () => nestedFactory,
    updateValue: () => {
      setDeepStore({ data: "newValue" });
    },
    useStoreGet: () => store,
    useStoreSet: () => setStore({ data: "newData" }),
  };
}

function nestedFactory() {
  return {
    getData: () => getDeepStore<Store>().data,
  };
}

const deepStore1 = createDeepStore({ data: "value1" }, factory); //Factory called with deep store: { data: 'value1', instanceId: 'store_mxpxtmw' }
const deepStore2 = createDeepStore({ data: "value2" }, factory); // Factory called with deep store: { data: 'value2', instanceId: 'store_v3s7gtp' }

console.log(deepStore1.useStoreGet());
deepStore1.useStoreSet();
console.log(deepStore1.useStoreGet());

// const registryStore = createDeepStore({ data: "registry" });
// const client = registryStore.withStore(factory); // Factory called with deep store: { data: 'registry', instanceId: 'store_typeupq' }

// console.log("Deep Store 1:", deepStore1.data); // Deep Store 1: value1
// console.log("Deep Store 2:", deepStore2.data); // Deep Store 2: value2
// console.log(
//   "Nested Factory Data from Store 1:",
//   deepStore1.nestedFactory().getData() // Nested Factory Data from Store 1: value1
// );
// console.log(
//   "Nested Factory Data from Store 2:",
//   deepStore2.nestedFactory().getData() // Nested Factory Data from Store 2: value2
// );

// console.log("Client Data:", client.data); // Client Data: registry
// console.log(
//   "Client Nested Factory Data:",
//   client.nestedFactory().getData() // Client Nested Factory Data: registry
// );

// registryStore.withStore(() => {
//   console.log(getDeepStore<Store>()); // registry
// });

console.log(deepStore1.getData());
console.log(deepStore2.getData());
deepStore2.updateValue();
console.log(deepStore1.getData());
console.log(deepStore2.getData());

// function factory() {
//   const store = getDeepStore<Store>();
//   return {
//     getData: () => store.data,
//     createNewFactory: factory,
//   };
// }

// const client1 = createDeepStore({ data: "foo" });
// const client2 = createDeepStore({ data: "bar" });
// let factory1: ReturnType<typeof factory>, factory2: ReturnType<typeof factory>;
// client1.withStore(() => {
//   factory1 = factory();
//   console.log(factory1.getData()); // foo
// });

// client2.withStore(() => {
//   factory2 = factory();
//   console.log(factory2.getData());
// });

// client1.withStore(() => {
//   console.log(factory1.createNewFactory().getData()); // foo
// });

// client2.withStore(() => {
//   console.log(factory2.createNewFactory().getData()); // bar
// });
