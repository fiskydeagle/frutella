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
      sortable: true,
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
      sortable: true,
    },
    {
      key: "status",
      label: i18n.t("pages.orders.status"),
      isVisible: true,
      class: "w-px",
      sortable: true,
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

const searchWord = ref<string>();

const ordersRows = computed(() => {
  return orders.value
    ?.map((order) => {
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

      const prepareTotalPrice = order.rows.reduce(
        (accumulator: number, currentValue) => {
          return +(
            accumulator +
            +(currentValue.prepareSalePrice || 0) *
              +(currentValue.orderQty || 0)
          );
        },
        0,
      );

      return {
        date: new Date(order.date).getTime(),
        dateDate: format(new Date(order.date), "dd.MM.yyyy"),
        rawOrders: order.rows,
        orders: order.rows.map((row) => row.productName!).join(", "),
        totalPrice:
          order.status === OrderStatus.Processing
            ? "-"
            : +totalPrice.toFixed(2),
        prepareTotalPrice,
        user: order.user.company,
        status: order.status,
        statusCol: i18n.t("components.order.cart.status." + order.status),
        actions,
      };
    })
    .filter((order) => {
      if (!searchWord.value) return true;
      return (
        order.dateDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.orders.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.totalPrice
          .toString()
          .toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.statusCol?.toLowerCase().includes(searchWord.value?.toLowerCase())
      );
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
  totalPrice.value =
    row.status === OrderStatus.Processing
      ? row.prepareTotalPrice
      : row.totalPrice;
  currentCartDate.value = row.dateDate;
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
      const date = new Date(event.row.date);
      date.setHours(4, 0, 0, 0);

      const today = new Date();

      if (date > today) {
        await addOrderAction();
      } else {
        cartOpenAction(event.row);
      }
      break;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center">{{ i18n.t("pages.orders.orders") }}</h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-between items-end gap-2">
        <div class="flex gap-2 flex-wrap">
          <UFormGroup
            v-if="
              user && [UserRole.ADMIN, UserRole.EMPLOYEE].includes(user.role)
            "
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

          <UFormGroup size="lg" :label="i18n.t('common.search')">
            <UInput v-model="searchWord" />
          </UFormGroup>
        </div>

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
        @select="action({ event: 'show-cart', row: $event })"
      >
        <template #date-data="{ row }">
          {{ row.dateDate }}
        </template>

        <template #orders-data="{ row }">
          <p class="whitespace-normal">{{ row.orders }}</p>
        </template>

        <template #totalPrice-data="{ row }">
          <span class="block text-right" v-if="row.totalPrice !== '-'">
            {{ row.totalPrice.toFixed(2) }} €
          </span>
          <span v-else>-</span>
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
