<script setup lang="ts">
import { useIncoming } from "~/composables/useIncoming";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.incoming"),
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
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.incoming.title") }}
    </h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
      <Incoming-Item />
    </div>
    <pre class="text-xs">{{ incomings }}</pre>
  </div>
</template>
