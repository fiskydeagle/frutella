<script setup lang="ts">
useHead(() => {
  return {
    title: "Frutella - Orders",
    meta: [
      {
        name: "description",
        content: "Orders Page.",
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
    <h1 class="text-3xl text-center">Orders</h1>
  </div>
</template>
