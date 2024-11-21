<script setup lang="ts">
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
    <h1 class="text-3xl text-center">Profile</h1>
  </div>
</template>
