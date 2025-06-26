<template>
  <header>
    <img
      alt="Vue logo"
      class="logo"
      src="./assets/logo.svg"
      width="125"
      height="125"
    />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
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

console.log(client.jobs.getProgramNetwork());
console.log(devClient.jobs.getProgramNetwork());
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
