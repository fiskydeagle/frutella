<script setup>
import { useAuthUser } from "~/composables/useAuthUser";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.index"),
    meta: [
      {
        name: "description",
        content: "Home Page.",
      },
    ],
  };
});

definePageMeta({
  middleware: "auth",
});

const { user } = useAuthUser();
</script>

<template>
  <div>
    <h1 class="text-3xl text-center">{{ i18n.t("pages.index.home") }}</h1>
    <pre>{{ user }}</pre>
  </div>
</template>
