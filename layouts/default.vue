<script setup lang="ts">
import { useAuthUser } from "~/composables/useAuthUser";

const { authToken } = useAuthUser();
const isLoggedIn = computed(() => !!authToken);
</script>
<template>
  <div class="py-10 flex max-sm:flex-col">
    <div v-if="isLoggedIn" class="pl-6 shrink-0">
      <LeftNavigation />
    </div>
    <div class="w-full sm:w-1 grow">
      <div class="px-6 max-w-screen-xl mx-auto">
        <slot />
      </div>
    </div>
    <UNotifications />
  </div>
</template>
