import { createDeepStore, getDeepStore, setDeepStore } from "..";

describe("Simple Usage", () => {
  it("should create a store without a factory and return withStore wrapper", () => {
    const store = createDeepStore({ data: "value" });

    expect(store).toHaveProperty("withStore");

    store.withStore(({ state, instanceId }) => {
      expect(state.data).toBe("value");
      expect(instanceId).toBeDefined();

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
      updateNetwork: () =>
        setDeepStore<{ network: string }>(({ network }) => ({
          network: `${network} - updated`,
        })),
    }));
  }

  it("should retain deep context across multiple instances", () => {
    const client = createClient("mainnet");
    const devClient = createClient("devnet");

    expect(client.jobs.getProgramNetwork()).toEqual("mainnet");
    expect(devClient.jobs.getProgramNetwork()).toEqual("devnet");
  });
  it("should be able to update it's state and retain its instance", () => {
    const client = createClient("mainnet");
    const devClient = createClient("devnet");

    expect(client.jobs.getProgramNetwork()).toEqual("mainnet");
    expect(devClient.jobs.getProgramNetwork()).toEqual("devnet");
    client.updateNetwork();
    expect(client.jobs.getProgramNetwork()).toEqual("mainnet - updated");
    expect(devClient.jobs.getProgramNetwork()).toEqual("devnet");
    devClient.updateNetwork();
    expect(client.jobs.getProgramNetwork()).toEqual("mainnet - updated");
    expect(devClient.jobs.getProgramNetwork()).toEqual("devnet - updated");
  });
});
