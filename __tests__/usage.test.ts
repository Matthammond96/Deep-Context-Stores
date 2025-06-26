import { createDeepStore, getDeepStore } from "..";

describe("Simple Usage", () => {
  it("should create a store without a factory and return withStore wrapper", () => {
    const store = createDeepStore({ data: "value" });

    expect(store).toHaveProperty("withStore");

    store.withStore((context) => {
      expect(context.data).toBe("value");
      expect(context.instanceId).toBeDefined();

      () => {
        const deepStore = getDeepStore<{ data: string }>();
        expect(deepStore.data).toBe("value");
      };
    });
  });

  it("should create a store with a factory and return the factory result", () => {
    const factory = jest.fn(() => ({
      getData: () => getDeepStore<{ data: string }>().data,
    }));
    const store = createDeepStore({ data: "value" }, factory);

    expect(factory).toHaveBeenCalled();
    expect(store.getData()).toBe("value");
  });
});

describe("Multi Instances", () => {
  it("should retain deep context across multiple instances", () => {
    function getProgramNetwork() {
      return getDeepStore().network;
    }

    function createJobs() {
      return {
        getProgramNetwork,
      };
    }

    function createClient(network: string) {
      return createDeepStore({ network }, () => ({
        jobs: createJobs(),
      }));
    }

    const client = createClient("mainnet");
    const devClient = createClient("devnet");

    expect(client.jobs.getProgramNetwork()).toEqual("mainnet");
    expect(devClient.jobs.getProgramNetwork()).toEqual("devnet");
  });
});
