<script setup>
import { useAuthUser } from "~/composables/useAuthUser";

useHead(() => {
  return {
    title: "Frutella - Home",
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
    <h1 class="text-3xl text-center">Home</h1>
    <pre>{{ user }}</pre>
  </div>
</template>
