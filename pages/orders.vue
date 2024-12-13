<script setup lang="ts">
import { useOrder } from "~/composables/useOrder";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.orders"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.orders"),
      },
    ],
  };
});

definePageMeta({
  middleware: "auth",
});

const { orders, getOrders } = useOrder();
await getOrders();
</script>

<template>
  <div>
    <h1 class="text-3xl text-center">{{ i18n.t("pages.orders.orders") }}</h1>
    <pre>{{ orders }}</pre>
  </div>
</template>
