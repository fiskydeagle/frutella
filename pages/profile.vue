<script setup lang="ts">
const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - Profile",
    meta: [
      {
        name: "description",
        content: "Profile Page.",
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
    <h1 class="text-3xl text-center">{{ i18n.t("pages.profile.profile") }}</h1>
  </div>
</template>
