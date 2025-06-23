import { createDeepStore, getDeepStore } from "../index.ts";

type Store = {
  data: string;
};

export function factory() {
  const deepStore = getDeepStore<Store>();
  console.log("Factory called with deep store:", deepStore);
  return {
    data: deepStore.data,
    nestedFactory: nestedFactory(),
  };
}

function nestedFactory() {
  return {
    getData: () => getDeepStore<Store>().data,
  };
}

const deepStore1 = createDeepStore({ data: "value1" }, factory);
const deepStore2 = createDeepStore({ data: "value2" }, factory);

console.log("Deep Store 1:", deepStore1.data);
console.log("Deep Store 2:", deepStore2.data);
console.log(
  "Nested Factory Data from Store 1:",
  deepStore1.nestedFactory.getData()
);
console.log(
  "Nested Factory Data from Store 2:",
  deepStore2.nestedFactory.getData()
);
