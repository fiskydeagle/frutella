<script setup lang="ts">
import { usePurchase } from "~/composables/usePurchase";
import { type Purchase, type PurchaseState } from "~/types";
import { format } from "date-fns";

const i18n = useI18n();
const route = useRoute();

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
      sortable: true,
    },
    {
      key: "purchases",
      label: i18n.t("pages.purchases.purchases"),
      isVisible: true,
      class: "max-w-xl",
    },
    {
      key: "totalPrice",
      label: i18n.t("pages.purchases.total-price"),
      isVisible: true,
      class: "w-px",
      sortable: true,
    },
    {
      key: "purchasedAt",
      label: i18n.t("pages.purchases.purchased-at"),
      isVisible: true,
      sortable: true,
    },
    {
      key: "purchasedBy",
      label: i18n.t("pages.purchases.purchased-by"),
      isVisible: true,
      sortable: true,
    },
  ];

  return columns;
});

const searchWord = ref<string>();

const purchasesRows = computed(() => {
  return purchases.value
    ?.map((purchase) => {
      const actions = [
        {
          event: "show-cart",
          label: i18n.t("pages.purchases.show-purchases"),
          icon: "ph:shopping-cart-simple-duotone",
        },
      ];

      const purchasedAt =
        purchase.rows && purchase.rows.length
          ? new Date(purchase.rows[0].updatedAt).getTime()
          : "-";

      const purchasedAtDate =
        purchase.rows && purchase.rows.length
          ? format(new Date(purchase.rows[0].updatedAt), "dd.MM.yyyy HH:mm")
          : "-";

      const purchasedBy =
        purchase.rows &&
        purchase.rows.length &&
        purchase.rows[0].updatedByUserFirstName
          ? `${purchase.rows[0].updatedByUserFirstName} ${purchase.rows[0].updatedByUserLastName}`
          : "-";

      const totalPrice = purchase.rows.reduce(
        (accumulator: number, currentValue) => {
          return +(
            accumulator +
            +(currentValue.price || 0) * +(currentValue.qty || 0)
          );
        },
        0,
      );

      return {
        date: new Date(purchase.date).getTime(),
        dateDate: format(new Date(purchase.date), "dd.MM.yyyy"),
        rawOrders: purchase.rows,
        purchases: purchase.rows
          .map((row) => `${row.productName!} (${row.supplierName!})`)
          .join(", "),
        totalPrice: +totalPrice.toFixed(2),
        purchasedAt,
        purchasedAtDate,
        purchasedBy,
        actions,
      };
    })
    .filter((order) => {
      if (!searchWord.value) return true;
      return (
        order.dateDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.purchases
          .toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.totalPrice
          .toString()
          .toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.purchasedAtDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.purchasedBy
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase())
      );
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
const totalPrice = ref<string | number>();
const currentCartPurchases = ref<Purchase[]>([]);
const currentCartDate = ref<string | number>("");
const cartOpenAction = (row: any) => {
  currentCartPurchases.value = row.rawOrders;
  totalPrice.value = row.totalPrice;
  currentCartDate.value = row.dateDate;
  cartModal.value = true;
};
const cartClose = () => {
  cartModal.value = false;
  currentCartPurchases.value = [];
  totalPrice.value = "";
  currentCartDate.value = "";
};

const action = async (event: { event: string; row: any }) => {
  switch (event.event) {
    case "show-cart":
      const date = new Date(event.row.purchasedAt);
      const today = new Date();
      today.setHours(1, 0, 0);

      if (date < today) {
        cartOpenAction(event.row);
      } else {
        await addPurchaseAction();
      }
      break;
  }
};

onMounted(() => {
  if (route.query.modal) {
    addPurchaseAction();
  }
});
</script>

<template>
  <div>
    <h1 class="text-3xl text-center">
      {{ i18n.t("pages.purchases.purchases") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-between items-end gap-2">
        <UFormGroup size="lg" :label="i18n.t('common.search')">
          <UInput v-model="searchWord" />
        </UFormGroup>

        <UButton size="lg" type="button" @click="addPurchaseAction">
          {{ i18n.t("pages.purchases.purchase") }}
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-purchases'"
        :columns="columns"
        :rows="purchasesRows"
        @on-action-click="action"
        @select="action({ event: 'show-cart', row: $event })"
      >
        <template #date-data="{ row }">
          {{ row.dateDate }}
        </template>

        <template #purchases-data="{ row }">
          <p class="whitespace-normal">{{ row.purchases }}</p>
        </template>

        <template #totalPrice-data="{ row }">
          <span class="block text-right">
            {{ row.totalPrice.toFixed(2) }} €
          </span>
        </template>

        <template #purchasedAt-data="{ row }">
          {{ row.purchasedAtDate }}
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
    :total-price="totalPrice"
    @on-close="cartClose"
  />
</template>
