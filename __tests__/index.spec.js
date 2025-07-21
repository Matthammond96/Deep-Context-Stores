import { loadModule } from "./loadModule";

const { createDeepStore, getDeepStore, setDeepStore, useDeepStore } =
  await loadModule();

describe("Deep Context Stores", () => {
  describe("createDeepStore", () => {
    test("when only passed initial state it should return withStore mode", () => {
      const store = createDeepStore({ data: "foo" });

      expect(store).toHaveProperty("withStore");
      store.withStore(() => {
        expect(getDeepStore()).toEqual({ data: "foo" });
      });
    });

    test("when passed initial state and a factory, it should return the factories value", () => {
      function clientFactory() {
        const store = getDeepStore();
        return {
          data: store,
          nested: () => `nested ${getDeepStore().data}`,
        };
      }

      const client = createDeepStore({ data: "bar" }, clientFactory);
      expect(client.data).toEqual({ data: "bar" });
      expect(client.nested()).toEqual("nested bar");
    });
  });

  describe("getDeepStore", () => {
    const store = createDeepStore({ data: "foobar" });
    store.withStore(() => {
      const ctx = getDeepStore();
      expect(ctx).toEqual({ data: "foobar" });
    });
  });

  describe("setDeepStore", () => {
    const { withStore } = createDeepStore({ data: "foo" });
    withStore(() => {
      const store = getDeepStore();
      expect(store).toEqual({ data: "foo" });
      setDeepStore({ data: "bar" });
      expect(store).toEqual({ data: "bar" });
      setDeepStore((state) => ({ data: state.data + "!" }));
      expect(store).toEqual({ data: "bar!" });
    });
  });

  describe("useDeepStore", () => {
    it("should return a get and set array", () => {
      const { withStore } = createDeepStore({
        data: "foo",
      });
      withStore(() => {
        const [store, setStore] = useDeepStore();

        expect(store).toEqual({ data: "foo" });
        setStore({ data: "bar" });
        expect(store).toEqual({ data: "bar" });
        setStore(({ data }) => ({
          data: data + "!",
        }));
        expect(store).toEqual({ data: "bar!" });
      });
    });
  });
});
