<script setup lang="ts">
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
    <h1 class="text-3xl text-center">Incoming</h1>
  </div>
</template>
