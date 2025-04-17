<script setup>
import { useAuthUser } from "~/composables/useAuthUser";
import { UserRole } from "~/types";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.index"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.index"),
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
    <h1 class="text-3xl text-center mb-4">{{ i18n.t("pages.index.home") }}</h1>
    <div class="flex justify-center">
      <div class="grid grid-cols-2 gap-4">
        <UButton
          icon="ph:shopping-cart-simple-duotone"
          size="xl"
          color="gray"
          :label="i18n.t('pages.index.new-order')"
          class="flex-col col-span-2 min-w-64"
          :ui="{
            icon: {
              size: {
                xl: 'h-10 w-10',
              },
            },
          }"
          :to="{
            name: 'orders',
            query: {
              modal: true,
            },
          }"
        />

        <UButton
          v-if="[UserRole.ADMIN, UserRole.EMPLOYEE].includes(user.role)"
          icon="ph:money-wavy-duotone"
          size="xl"
          color="gray"
          :label="i18n.t('pages.index.buy')"
          class="flex-col"
          :ui="{
            icon: {
              size: {
                xl: 'h-10 w-10',
              },
            },
          }"
          :to="{
            name: 'purchases',
            query: {
              modal: true,
            },
          }"
        />

        <UButton
          v-if="[UserRole.ADMIN, UserRole.EMPLOYEE].includes(user.role)"
          icon="ph:handshake-duotone"
          size="xl"
          color="gray"
          :label="i18n.t('pages.index.sales')"
          class="flex-col"
          :ui="{
            icon: {
              size: {
                xl: 'h-10 w-10',
              },
            },
          }"
          :to="{
            name: 'sales',
          }"
        />

        <UButton
          v-if="[UserRole.ADMIN, UserRole.EMPLOYEE].includes(user.role)"
          icon="ph:truck-duotone"
          size="xl"
          color="gray"
          :label="i18n.t('pages.index.add-supplier')"
          class="flex-col"
          :ui="{
            icon: {
              size: {
                xl: 'h-10 w-10',
              },
            },
          }"
          :to="{
            name: 'suppliers',
            query: {
              modal: true,
            },
          }"
        />

        <UButton
          v-if="[UserRole.ADMIN].includes(user.role)"
          icon="ph:package-duotone"
          size="xl"
          color="gray"
          :label="i18n.t('pages.index.add-product')"
          class="flex-col"
          :ui="{
            icon: {
              size: {
                xl: 'h-10 w-10',
              },
            },
          }"
          :to="{
            name: 'products',
            query: {
              modal: true,
            },
          }"
        />
      </div>
    </div>
  </div>
</template>
