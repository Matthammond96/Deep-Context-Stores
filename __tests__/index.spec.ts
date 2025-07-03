import { createDeepStore, getDeepStore, setDeepStore, useDeepStore } from "..";

type Store = { data: string };

describe("Deep Context Stores", () => {
  describe("createDeepStore", () => {
    test("when only passed initial state it should return withStore mode", () => {
      const store = createDeepStore({ data: "foo" });

      expect(store).toHaveProperty("withStore");
      store.withStore(() => {
        expect(getDeepStore<Store>()).toEqual({ data: "foo" });
      });
    });

    test("when passed initial state and a factory, it should return the factories value", () => {
      function clientFactory() {
        const store = getDeepStore<Store>();
        return {
          data: store,
          nested: () => `nested ${getDeepStore<Store>().data}`,
        };
      }

      const client = createDeepStore({ data: "bar" }, clientFactory);
      expect(client.data).toEqual({ data: "bar" });
      expect(client.nested()).toEqual("nested bar");
    });
  });

  describe("getDeepStore", () => {
    const store = createDeepStore<Store>({ data: "foobar" });
    store.withStore(() => {
      const ctx = getDeepStore<Store>();
      expect(ctx).toEqual({ data: "foobar" });
    });
  });

  describe("setDeepStore", () => {
    const { withStore } = createDeepStore<Store>({ data: "foo" });
    withStore(() => {
      const store = getDeepStore<Store>();
      expect(store).toEqual({ data: "foo" });
      setDeepStore<Store>({ data: "bar" });
      expect(store).toEqual({ data: "bar" });
      setDeepStore<Store>((state) => ({ data: state.data + "!" }));
      expect(store).toEqual({ data: "bar!" });
    });
  });

  describe("useDeepStore", () => {
    it("should return a get and set array", () => {
      const { withStore } = createDeepStore<Store>({
        data: "foo",
      });
      withStore(() => {
        const [store, setStore] = useDeepStore<Store>();

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
