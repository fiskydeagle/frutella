<script setup lang="ts">
import { useAuthUser } from "~/composables/useAuthUser";
import { useSystemUsers } from "~/composables/useSystemUsers";
import { useOrder } from "~/composables/useOrder";
import { type Order, type OrderState, OrderStatus, UserRole } from "~/types";
import { format } from "date-fns";

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
  middleware: ["auth", "verified"],
});

const { user } = useAuthUser();
const { customers, getCustomers } = useSystemUsers();
const computedCustomers = computed(() => {
  if (!customers.value) return [];

  return customers.value?.map((customer) => ({
    ...customer,
    customName:
      customer.company +
      (customer.firstName && customer.lastName
        ? ` (${customer.firstName} ${customer.lastName})`
        : ""),
  }));
});
const {
  orderUser,
  orders,
  getOrders,
  currentOrders,
  getCurrentOrders,
  addOrder,
} = useOrder();

const orderUserComputed = computed(() => {
  if (
    user.value &&
    [UserRole.ADMIN, UserRole.EMPLOYEE].includes(user.value?.role)
  ) {
    return orderUser.value;
  }

  return undefined;
});

const columns = computed(() => {
  const columns = [
    {
      key: "date",
      label: i18n.t("pages.orders.date"),
      isVisible: true,
      class: "w-px",
    },
    {
      key: "orders",
      label: i18n.t("pages.orders.orders"),
      isVisible: true,
      class: "max-w-xl",
    },
    {
      key: "totalPrice",
      label: i18n.t("pages.orders.total-price"),
      isVisible: true,
      class: "w-px",
    },
    {
      key: "status",
      label: i18n.t("pages.orders.status"),
      isVisible: true,
      class: "w-px",
    },
  ];

  if (orderUserComputed.value) {
    columns.push({
      key: "user",
      label: i18n.t("pages.orders.client"),
      isVisible: true,
      class: "w-px",
    });
  }

  return columns;
});

const ordersRows = computed(() => {
  return orders.value?.map((order) => {
    const actions = [
      {
        event: "show-cart",
        label: i18n.t("pages.orders.show-cart"),
        icon: "ph:shopping-cart-simple-duotone",
      },
    ];

    const totalPrice = order.rows.reduce(
      (accumulator: number, currentValue) => {
        return +(
          accumulator +
          +(currentValue.salePrice || 0) * +(currentValue.qty || 0)
        );
      },
      0,
    );

    return {
      date: format(new Date(order.date), "dd.MM.yyyy"),
      rawOrders: order.rows,
      orders: order.rows.map((row) => row.productName!).join(", "),
      totalPrice:
        order.status === OrderStatus.Processing
          ? "-"
          : totalPrice.toFixed(2) + " €",
      user: order.user.company,
      status: order.status,
      actions,
    };
  });
});

if (
  user.value &&
  [UserRole.ADMIN, UserRole.EMPLOYEE].includes(user.value?.role)
) {
  await getCustomers();
} else {
  orderUser.value = user.value;
  await getOrders();
}

watch(
  () => orderUser.value,
  async (value) => {
    if (value) await getOrders();
  },
);

const orderAddModal = ref<boolean>(false);
const orderAddLoading = ref<boolean>(false);
const addOrderAction = async () => {
  await getCurrentOrders();
  orderAddModal.value = true;
};
const onAddOrder = async (state: OrderState[]) => {
  orderAddLoading.value = true;

  if (await addOrder(state, orderUser.value?.id || -1)) {
    orderAddModal.value = false;
  }

  orderAddLoading.value = false;
};
const addOrderClose = () => {
  orderAddModal.value = false;
};

const cartModal = ref<boolean>(false);
const totalPrice = ref<string | number>();
const currentCartOrders = ref<Order[]>([]);
const currentCartDate = ref<string | number>("");
const cartOpenAction = (row: any) => {
  currentCartOrders.value = row.rawOrders;
  totalPrice.value = row.totalPrice;
  currentCartDate.value = row.date;
  cartModal.value = true;
};
const cartClose = () => {
  cartModal.value = false;
  currentCartOrders.value = [];
  totalPrice.value = "";
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
    <h1 class="text-3xl text-center">{{ i18n.t("pages.orders.orders") }}</h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-between items-end gap-2">
        <UFormGroup
          v-if="user && [UserRole.ADMIN, UserRole.EMPLOYEE].includes(user.role)"
          size="lg"
          :label="i18n.t('pages.orders.client')"
          name="unitType"
        >
          <USelectMenu
            v-model="orderUser"
            searchable
            :search-attributes="['customName']"
            :options="computedCustomers"
            option-attribute="customName"
            :placeholder="i18n.t('pages.orders.choose-user')"
          />
        </UFormGroup>
        <span v-else></span>

        <UButton
          size="lg"
          type="button"
          :disabled="!orderUser"
          @click="addOrderAction"
        >
          {{ i18n.t("pages.orders.order") }}
        </UButton>
      </div>
    </div>

    <p v-if="!orderUser" class="mt-6 text-xl text-center">
      {{ i18n.t("pages.orders.please-select-user") }}
    </p>

    <ClientOnly v-else>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-orders'"
        :columns="columns"
        :rows="ordersRows"
        @on-action-click="action"
      >
        <template #orders-data="{ row }">
          <p class="whitespace-normal">{{ row.orders }}</p>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :color="
              row.status === OrderStatus.Processing
                ? 'orange'
                : row.status === OrderStatus.Done
                  ? 'primary'
                  : 'red'
            "
          >
            <span class="capitalize">
              {{ i18n.t("components.order.cart.status." + row.status) }}
            </span>
          </UBadge>
        </template>
      </DataTable>
    </ClientOnly>
  </div>

  <OrderAdd
    :is-modal-open="orderAddModal"
    :current-orders="currentOrders || []"
    :loading="orderAddLoading"
    :order-user="orderUserComputed"
    @on-close="addOrderClose"
    @on-submit="onAddOrder"
  />

  <OrderCart
    :is-modal-open="cartModal"
    :current-orders="currentCartOrders || []"
    :date="currentCartDate || ''"
    :order-user="orderUserComputed"
    :total-price="totalPrice"
    @on-close="cartClose"
  />
</template>
