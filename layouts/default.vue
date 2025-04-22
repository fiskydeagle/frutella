<script setup lang="ts">
const i18n = useI18n();

import { useAuthUser } from "~/composables/useAuthUser";

const { authToken, user } = useAuthUser();
const isLoggedIn = computed(() => {
  return authToken.value;
});
</script>
<template>
  <div class="py-10 flex max-sm:flex-col flex-grow">
    <div v-if="isLoggedIn" class="pl-6 shrink-0">
      <LeftNavigation />
    </div>
    <div class="w-full sm:w-1 grow">
      <div class="px-6 max-w-screen-xl mx-auto">
        <UAlert
          v-if="user && !user.verified"
          icon="ph:warning-duotone"
          color="orange"
          variant="subtle"
          :title="i18n.t('layout.account-not-verified')"
          class="mb-6"
        />
        <slot />
      </div>
    </div>
    <UNotifications />
  </div>
  <div class="px-6">
    <div class="py-4 container m-auto border-t border-gray-200">
      <p class="text-center text-gray-500" v-html="i18n.t('layout.footer')"></p>
    </div>
  </div>
</template>
