<script setup lang="ts">
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
  middleware: "auth",
});
</script>

<template>
  <div>
    <h1 class="text-3xl text-center">{{ i18n.t("pages.incoming.title") }}</h1>
    <div></div>
  </div>
</template>
