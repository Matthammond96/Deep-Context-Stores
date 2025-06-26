<template>
  <main>
    <h2>Client 1 store: {{ client1Store }}</h2>
    <h2>Client 2 store: {{ client2Store }}</h2>
  </main>
</template>

<script setup lang="ts">
import { createDeepStore, getDeepStore } from "deep-context-stores";

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

const client1Store = client.jobs.getProgramNetwork();
const client2Store = devClient.jobs.getProgramNetwork();
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
