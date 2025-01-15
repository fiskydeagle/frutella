<script setup lang="ts">
import { useAuthUser } from "~/composables/useAuthUser";
import { usePurchase } from "~/composables/usePurchase";
import { type Purchase, type PurchaseState, UserRole } from "~/types";
import { format } from "date-fns";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.purchases"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.purchases"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "verified", "employee"],
});

const { user } = useAuthUser();
const {
  purchases,
  getPurchases,
  currentPurchases,
  getCurrentPurchases,
  addPurchase,
} = usePurchase();
await getPurchases();

const columns = computed(() => {
  const columns = [
    {
      key: "date",
      label: i18n.t("pages.purchases.date"),
      isVisible: true,
      class: "w-px",
    },
    {
      key: "purchases",
      label: i18n.t("pages.purchases.purchases"),
      isVisible: true,
      class: "max-w-xl",
    },
    {
      key: "purchasedAt",
      label: i18n.t("pages.purchases.purchased-at"),
      isVisible: true,
    },
    {
      key: "purchasedBy",
      label: i18n.t("pages.purchases.purchased-by"),
      isVisible: true,
    },
  ];

  return columns;
});

const purchasesRows = computed(() => {
  return purchases.value?.map((purchase) => {
    const actions = [
      {
        event: "show-cart",
        label: i18n.t("pages.purchases.show-purchases"),
        icon: "ph:shopping-cart-simple-duotone",
      },
    ];

    const purchasedAt =
      purchase.rows && purchase.rows.length
        ? format(new Date(purchase.rows[0].updatedAt), "dd.MM.yyyy HH:mm")
        : "-";

    const purchasedBy =
      purchase.rows &&
      purchase.rows.length &&
      purchase.rows[0].updatedByUserFirstName
        ? `${purchase.rows[0].updatedByUserFirstName} ${purchase.rows[0].updatedByUserLastName}`
        : "-";

    return {
      date: format(new Date(purchase.date), "dd.MM.yyyy"),
      rawOrders: purchase.rows,
      purchases: purchase.rows
        .map((row) => `${row.productName!} (${row.supplierName!})`)
        .join(", "),
      purchasedAt,
      purchasedBy,
      actions,
    };
  });
});

const purchaseAddModal = ref<boolean>(false);
const purchaseAddLoading = ref<boolean>(false);
const addPurchaseAction = async () => {
  await getCurrentPurchases();
  purchaseAddModal.value = true;
};
const onAddPurchase = async (state: PurchaseState[]) => {
  purchaseAddLoading.value = true;

  if (await addPurchase(state)) {
    purchaseAddModal.value = false;
  }

  purchaseAddLoading.value = false;
};
const addPurchaseClose = () => {
  purchaseAddModal.value = false;
};

const cartModal = ref<boolean>(false);
const currentCartPurchases = ref<Purchase[]>([]);
const currentCartDate = ref<string | number>("");
const cartOpenAction = (row: any) => {
  currentCartPurchases.value = row.rawOrders;
  currentCartDate.value = row.date;
  cartModal.value = true;
};
const cartClose = () => {
  cartModal.value = false;
  currentCartPurchases.value = [];
  currentCartDate.value = "";
};

const action = async (event: { event: string; row: any }) => {
  switch (event.event) {
    case "show-cart":
      cartOpenAction(event.row);
      break;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center">
      {{ i18n.t("pages.purchases.purchases") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-end items-end gap-2">
        <UButton size="lg" type="button" @click="addPurchaseAction">
          {{ i18n.t("pages.purchases.purchase") }}
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-orders'"
        :columns="columns"
        :rows="purchasesRows"
        @on-action-click="action"
      >
        <template #purchases-data="{ row }">
          <p class="whitespace-normal">{{ row.purchases }}</p>
        </template>

        <template #status-data="{ row }">
          <span class="capitalize">
            {{ i18n.t("components.order.cart.status." + row.status) }}
          </span>
        </template>
      </DataTable>
    </ClientOnly>
  </div>

  <PurchaseAdd
    :is-modal-open="purchaseAddModal"
    :current-purchases="currentPurchases || []"
    :loading="purchaseAddLoading"
    @on-close="addPurchaseClose"
    @on-submit="onAddPurchase"
  />

  <PurchaseCart
    :is-modal-open="cartModal"
    :current-purchases="currentCartPurchases || []"
    :date="currentCartDate || ''"
    @on-close="cartClose"
  />
</template>
