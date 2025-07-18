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
