<script setup lang="ts">
const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.orders"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.orders"),
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
    <h1 class="text-3xl text-center">{{ i18n.t("pages.orders.orders") }}</h1>
  </div>
</template>
