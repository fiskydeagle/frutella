<script setup lang="ts">
import { useIncoming } from "~/composables/useIncoming";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - Incoming",
    meta: [
      {
        name: "description",
        content: "Incoming Page.",
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "employee"],
});

const { incomings, getIncomings } = useIncoming();
await getIncomings();
</script>

<template>
  <div>
    <h1 class="text-3xl text-center">{{ i18n.t("pages.incoming.title") }}</h1>
    <pre class="text-xs">{{ incomings }}</pre>
  </div>
</template>
