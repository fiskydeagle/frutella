<script setup lang="ts">
import { useAuthUser } from "~/composables/useAuthUser";
import { UserRole } from "~/types";

const i18n = useI18n();
const { user, authToken } = useAuthUser();
const route = useRoute();

const links = computed(() => {
  const links: any = [];
  const topLinks = [
    {
      label: i18n.t("components.left-navigation.orders"),
      icon: "ph:shopping-cart-duotone",
      to: { name: "orders" },
    },
  ];

  if (user.value && authToken.value) {
    const userLinks = [
      {
        label: i18n.t("components.left-navigation.profile"),
        avatar: {
          src: `https://www.gravatar.com/avatar/${user.value?.id}?s=100&d=identicon`,
        },
        to: { name: "profile" },
      },
      {
        label: i18n.t("components.left-navigation.logout"),
        icon: "ph:sign-out-duotone",
        to: { name: "logout" },
      },
    ];

    if (user.value?.role === UserRole.ADMIN) {
      topLinks.push({
        label: i18n.t("components.left-navigation.products"),
        icon: "ph:package-duotone",
        to: { name: "products" },
      });

      topLinks.push({
        label: i18n.t("components.left-navigation.users"),
        icon: "ph:users-three-duotone",
        to: { name: "users" },
      });
    }

    if ([UserRole.ADMIN, UserRole.EMPLOYEE].includes(user.value?.role)) {
      topLinks.push({
        label: i18n.t("components.left-navigation.incoming"),
        icon: "ph:chart-line-up-duotone",
        to: { name: "incoming" },
      });
    }

    links.push(topLinks);
    links.push(userLinks);
  }

  return links;
});

const isOpen = ref(false);
const windowWidth = ref<number>(0);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  updateWindowWidth();
  window.addEventListener("resize", updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWindowWidth);
});

watch(
  () => route.path,
  () => {
    isOpen.value = false;
  },
);
</script>
<template>
  <div>
    <div v-if="windowWidth > 640" class="flex flex-col items-start gap-3">
      <NuxtLink :to="{ name: 'index' }">
        <img
          src="/frutella.svg"
          :alt="i18n.t('components.left-navigation.home')"
          class="rounded-full w-20 h-auto ml-5"
        />
      </NuxtLink>
      <UVerticalNavigation :links="links" />
    </div>
    <div v-else>
      <UIcon
        name="ph:list-duotone"
        size="40"
        class="absolute cursor-pointer left-6 top-6"
        @click="isOpen = true"
      />

      <USlideover
        v-model="isOpen"
        :overlay="false"
        side="left"
        :ui="{
          width: 'w-screen max-w-sm',
        }"
      >
        <UCard
          class="flex flex-col flex-1"
          :ui="{
            body: { base: 'flex-1' },
            ring: '',
            divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-xl px-2">
                <strong>{{
                  i18n.t("components.left-navigation.navigation")
                }}</strong>
              </h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="-my-1"
                @click="isOpen = false"
              />
            </div>
          </template>

          <div class="flex flex-col items-start gap-3 w-full">
            <NuxtLink :to="{ name: 'index' }">
              <img
                src="/frutella.svg"
                :alt="i18n.t('components.left-navigation.home')"
                class="rounded-full w-20 h-auto ml-5"
              />
            </NuxtLink>
            <UVerticalNavigation :links="links" />
          </div>
        </UCard>
      </USlideover>
    </div>
  </div>
</template>
