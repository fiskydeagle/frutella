<script setup lang="ts">
import { type Order, OrderStatus, type SaleState, type User } from "~/types";
import { format } from "date-fns";
import { useSale } from "~/composables/useSale";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.sales"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.sales"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "verified", "employee"],
});

const { searchWord, orders, getOrders, sell } = useSale();
await getOrders();

const { kosovoCities } = useUtils();

const columns = computed(() => {
  const columns = [
    {
      key: "user",
      label: i18n.t("pages.sales.client"),
      isVisible: true,
      sortable: true,
    },
    {
      key: "city",
      label: i18n.t("pages.sales.city"),
      isVisible: true,
      sortable: true,
    },
    {
      key: "address",
      label: i18n.t("pages.sales.address"),
      isVisible: true,
      sortable: true,
    },
    {
      key: "tel",
      label: i18n.t("pages.sales.tel"),
      isVisible: true,
    },
    {
      key: "googleMap",
      label: i18n.t("pages.sales.google-map-link"),
      isVisible: true,
    },
    {
      key: "date",
      label: i18n.t("pages.sales.date"),
      isVisible: true,
      class: "w-px",
      sortable: true,
    },
    {
      key: "totalPrice",
      label: i18n.t("pages.sales.total-price"),
      isVisible: true,
      class: "w-px",
      sortable: true,
    },
    {
      key: "status",
      label: i18n.t("pages.sales.status"),
      isVisible: true,
      class: "w-px",
      sortable: true,
    },
  ];

  return columns;
});

const ordersRows = computed(() => {
  return orders.value
    ?.map((order) => {
      const actions = [];

      if (order.status === OrderStatus.Processing) {
        actions.push({
          event: "sell",
          label: i18n.t("pages.sales.sale"),
          icon: "ph:handshake-duotone",
        });
      } else {
        actions.push({
          event: "show-sales",
          label: i18n.t("pages.sales.show-sales"),
          icon: "ph:shopping-cart-simple-duotone",
        });
      }

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
        image: order.user.image,
        user: order.user.company,
        city: kosovoCities.find((city) => city.code === order.user.city)?.name,
        address: order.user.address,
        tel: order.user.tel,
        googleMap: order.user.googleMap,
        date: new Date(order.date).getTime(),
        dateDate: format(new Date(order.date), "dd.MM.yyyy"),
        totalPrice:
          order.status === OrderStatus.Processing
            ? "-"
            : +totalPrice.toFixed(2),
        status: order.status,
        statusCol: i18n.t("components.order.cart.status." + order.status),
        rawOrders: order.rows,
        rawUser: order.user,
        rawDate: order.date,
        actions,
      };
    })
    .filter((order) => {
      if (!searchWord.value) return true;
      return (
        order.user.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.city?.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.address
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.dateDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.totalPrice
          .toString()
          .toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.statusCol?.toLowerCase().includes(searchWord.value?.toLowerCase())
      );
    });
});

const sellLoading = ref<boolean>(false);
const sellModal = ref<boolean>(false);
const currentSellOrders = ref<Order[]>([]);
const currentSellDate = ref<string | number>("");
const currentSellUser = ref<User | undefined>();

const sellOpenAction = (row: any) => {
  currentSellOrders.value = row.rawOrders;
  currentSellDate.value = row.rawDate;
  currentSellUser.value = row.rawUser;
  sellModal.value = true;
};

const onSell = async (state: SaleState[]) => {
  sellLoading.value = true;

  if (await sell(state)) {
    sellModal.value = false;
  }

  sellLoading.value = false;
};

const sellClose = () => {
  sellModal.value = false;
  setTimeout(() => {
    currentSellOrders.value = [];
    currentSellDate.value = "";
    currentSellUser.value = undefined;
  }, 300);
};

const cartModal = ref<boolean>(false);
const totalPrice = ref<string | number>();
const currentCartOrders = ref<Order[]>([]);
const currentCartDate = ref<string | number>("");
const cartOpenAction = (row: any) => {
  currentCartOrders.value = row.rawOrders;
  totalPrice.value = row.totalPrice;
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
    case "sell":
      if (event.row.status === OrderStatus.Processing)
        sellOpenAction(event.row);
      else cartOpenAction(event.row);
      break;
    case "show-sales":
      cartOpenAction(event.row);
      break;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center">
      {{ i18n.t("pages.sales.sales") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-between items-end gap-2">
        <UFormGroup size="lg" :label="i18n.t('common.search')">
          <UInput v-model="searchWord" />
        </UFormGroup>
      </div>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-sales'"
        :columns="columns"
        :rows="ordersRows"
        @on-action-click="action"
        @select="action({ event: 'sell', row: $event })"
      >
        <template #date-data="{ row }">
          {{ row.dateDate }}
        </template>

        <template #user-data="{ row }">
          <div
            class="flex justify-start flex-wrap gap-x-2 gap-y-1 items-center"
            v-if="row.image"
          >
            <UPopover mode="hover" class="flex">
              <img
                :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${row.image}`"
                class="w-10 h-10 rounded object-cover border border-gray-300 block"
                alt="product image"
              />
              <template #panel>
                <div class="p-2">
                  <img
                    :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${row.image}`"
                    class="w-auto h-auto max-h-60 rounded"
                    alt="product image"
                  />
                </div>
              </template>
            </UPopover>
            <p>{{ row.user }}</p>
          </div>
          <span v-else>{{ row.user }}</span>
        </template>

        <template #totalPrice-data="{ row }">
          <span class="block text-right" v-if="row.totalPrice !== '-'">
            {{ row.totalPrice.toFixed(2) }} €
          </span>
          <span class="block text-right" v-else>-</span>
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

        <template #tel-data="{ row }">
          <a
            v-if="row.tel"
            @click.stop
            class="p-3 -m-3"
            :href="`tel:${row.tel}`"
          >
            {{ row.tel }}
          </a>
        </template>

        <template #googleMap-data="{ row }">
          <a
            v-if="row.googleMap"
            @click.stop
            class="inline-flex p-3 -m-3"
            :href="row.googleMap"
            target="_blank"
          >
            <UIcon name="ph:map-pin-duotone" size="30" />
          </a>
        </template>
      </DataTable>
    </ClientOnly>
  </div>

  <SellModal
    :is-modal-open="sellModal"
    :current-orders="currentSellOrders || []"
    :date="currentSellDate || ''"
    :order-user="currentSellUser"
    :loading="sellLoading"
    @on-close="sellClose"
    @on-submit="onSell"
  />

  <SellCart
    :is-modal-open="cartModal"
    :current-orders="currentCartOrders || []"
    :date="currentCartDate || ''"
    :total-price="totalPrice"
    @on-close="cartClose"
  />
</template>
