<script setup lang="ts">
import { type InferType, object, number } from "yup";
import { type Order, type User, type SaleState } from "~/types";
import type { FormSubmitEvent } from "#ui/types";
import { useSale } from "~/composables/useSale";
import { format } from "date-fns";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  currentOrders: Order[];
  orderUser?: User;
  date: string | number;
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", sales: SaleState[]): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { getSalesInfo, salesInfo } = useSale();

const getSalesInfoByProduct = (productId: number) => {
  const foundInfo = salesInfo.value?.find(
    (item) => item.productId === productId,
  );
  if (foundInfo) return foundInfo;
  return {
    productId: 0,
    totalOrderQty: 0,
    totalQty: 0,
    averagePrice: 0,
    averageSellingPrice: 0,
    orderQty: 0,
    maxOrderQty: 0,
    qty: 0,
    maxQty: 0,
    orderPercentage: 0,
    percentage: 0,
    recommendedOrderQty: 0,
    recommendedQty: 0,
  };
};

const schema = computed(() => {
  let ob: any = {};

  if (props.currentOrders) {
    for (const order of props.currentOrders) {
      const info = getSalesInfoByProduct(order.productId);
      ob[`orderQty-${order.id}`] = number()
        .transform((value, originalValue) => {
          return originalValue === "" ? null : value; //
        })
        .nullable()
        .optional()
        .moreThan(-1, "Quantity must be greater or equal to 0")
        .lessThan(
          +info.maxOrderQty.toFixed(2) + 0.01,
          "Quantity must be lower or equal to " + +info.maxOrderQty.toFixed(2),
        );

      ob[`qty-${order.id}`] = number()
        .transform((value, originalValue) => {
          return originalValue === "" ? null : value; //
        })
        .nullable()
        .optional()
        .moreThan(-1, "Quantity must be greater or equal to 0")
        .lessThan(
          +info.maxQty.toFixed(2) + 0.01,
          "Quantity must be lower or equal to " + +info.maxQty.toFixed(2),
        )
        .test("qty-required", "Required", function (value) {
          const orderQty = this.parent[`orderQty-${order.id}`];
          const hasOrderQty =
            orderQty !== null && orderQty !== undefined && orderQty !== 0;

          if (hasOrderQty) {
            return value !== null && value !== undefined && value !== 0;
          }

          return true;
        });
    }
  }

  return object(ob);
});

type Schema = InferType<typeof schema.value>;

const state = ref<any>({});

const fillState = () => {
  state.value = {};

  if (props.currentOrders) {
    for (const order of props.currentOrders) {
      const info = getSalesInfoByProduct(order.productId);
      state.value[`orderQty-${order.id}`] = ref(
        info.maxOrderQty < info.recommendedOrderQty
          ? info.maxOrderQty
          : info.recommendedOrderQty,
      );
      state.value[`qty-${order.id}`] = ref(
        info.maxQty < info.recommendedQty
          ? info.maxQty
          : info.recommendedQty
            ? info.recommendedQty
            : info.recommendedOrderQty,
      );
    }
  }
};

const isOpen = computed({
  get: () => props.isModalOpen,
  set: (value) => {
    if (!value) emits("onClose");
  },
});

watch(
  () => isOpen.value,
  async (isOpen) => {
    if (!isOpen) {
      state.value = {};
    } else {
      await getSalesInfo(props.orderUser?.id || -1, props.date);
      fillState();
    }
  },
);

const totalPrice = computed(() => {
  let total = 0;
  Object.keys(state.value).forEach((item) => {
    if (item.includes("qty-")) {
      const stateId = item.replace("qty-", "");
      const currentOrder = props.currentOrders.find(
        (item) => item.id === +stateId,
      );

      const percentage =
        props.orderUser?.userType && props.orderUser?.userType.percentage
          ? props.orderUser.userType.percentage
          : 0;

      total +=
        +state.value[`qty-${stateId}`] *
        (percentage === 0
          ? getSalesInfoByProduct(currentOrder?.productId || -1).averagePrice
          : getSalesInfoByProduct(currentOrder?.productId || -1)
              .averageSellingPrice *
            (1 + percentage / 100));
    }
  });
  return total;
});

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  const sales: SaleState[] = [];

  Object.keys(state.value).forEach((item) => {
    if (item.includes("qty-")) {
      const stateId = item.replace("qty-", "");
      const currentOrder = props.currentOrders.find(
        (item) => item.id === +stateId,
      );

      const percentage =
        props.orderUser?.userType && props.orderUser?.userType.percentage
          ? props.orderUser.userType.percentage
          : 0;

      sales.push({
        id: +stateId,
        orderQty: +state.value[`orderQty-${stateId}`],
        qty: +state.value[`qty-${stateId}`],
        price: getSalesInfoByProduct(currentOrder?.productId || -1)
          .averagePrice,
        salePrice:
          percentage === 0
            ? getSalesInfoByProduct(currentOrder?.productId || -1).averagePrice
            : getSalesInfoByProduct(currentOrder?.productId || -1)
                .averageSellingPrice *
              (1 + percentage / 100),
        comment: state.value[`comment-${stateId}`] || undefined,
      });
    }
  });

  emits("onSubmit", sales);
};

const onCancel = () => {
  const sales: SaleState[] = [];

  Object.keys(state.value).forEach((item) => {
    if (item.includes("qty-")) {
      const stateId = item.replace("qty-", "");
      const currentOrder = props.currentOrders.find(
        (item) => item.id === +stateId,
      );

      const percentage =
        props.orderUser?.userType && props.orderUser?.userType.percentage
          ? props.orderUser.userType.percentage
          : 0;

      sales.push({
        id: +stateId,
        orderQty: 0,
        qty: 0,
        price: getSalesInfoByProduct(currentOrder?.productId || -1)
          .averagePrice,
        salePrice:
          percentage === 0
            ? getSalesInfoByProduct(currentOrder?.productId || -1).averagePrice
            : getSalesInfoByProduct(currentOrder?.productId || -1)
                .averageSellingPrice *
              (1 + percentage / 100),
        comment: state.value[`comment-${stateId}`] || undefined,
      });
    }
  });

  emits("onSubmit", sales);
};
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-3xl',
    }"
  >
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div
            class="flex justify-between items-center text-lg font-normal leading-6"
          >
            <h6 class="text-xl">
              {{ i18n.t("components.sales.sale.sale") }}
              {{ i18n.t("common.for") }}
              {{ i18n.t("common.date") }}:
              {{ date ? format(new Date(date), "dd.MM.yyyy") : "" }}
            </h6>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1 text-neutral-500"
              @click="isOpen = false"
            />
          </div>
        </template>
        <div
          class="flex flex-col sm:divide-y max-sm:gap-3.5 divide-gray-200 dark:divide-gray-800 -mt-2 -mb-3"
        >
          <p
            v-if="!currentOrders || !currentOrders.length"
            class="text-xl text-center"
          >
            {{ i18n.t("components.sales.sale.no-purchases") }}
          </p>
          <div
            v-else
            v-for="(order, index) in currentOrders"
            :key="`order-${order.id}`"
            class="flex max-sm:grid max-sm:grid-cols-2 gap-3 justify-between pt-2 pb-3 max-sm:bg-neutral-100 max-sm:border !border-neutral-200 max-sm:p-3.5 max-sm:rounded-md"
          >
            <div
              class="flex shrink-0 items-center gap-2 col-span-2 w-full sm:w-1/5"
            >
              <UPopover mode="hover" class="flex shrink-0">
                <div class="bg-white mt-1 border border-gray-300 rounded p-1">
                  <img
                    :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${order.productImage}`"
                    class="w-14 h-14 object-cover"
                    alt="product image"
                  />
                </div>
                <template #panel>
                  <div class="p-2">
                    <img
                      :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${order.productImage}`"
                      class="w-auto h-auto max-h-60 rounded"
                      alt="product image"
                    />
                  </div>
                </template>
              </UPopover>
              <label
                class="text-lg font-medium text-gray-700 dark:text-gray-200"
              >
                {{ order.productName }}
                <span class="block text-sm">
                  ({{ order.orderQty }}
                  {{
                    i18n.t("components.product.add." + order.productUnitType)
                  }})
                </span>
              </label>
            </div>

            <div class="flex flex-col justify-between gap-2">
              <UFormGroup
                size="lg"
                :label="
                  i18n.t('components.product.add.' + order.productUnitType)
                "
                :name="`orderQty-${order.id}`"
                :ui="{
                  container: 'sm:text-center',
                  label: {
                    wrapper: 'sm:justify-end',
                    base: 'pl-3 sm:w-28',
                  },
                }"
                class="shrink w-full sm:w-36"
              >
                <div class="flex flex-col items-end max relative group">
                  <UInput
                    type="number"
                    :min="0"
                    :step="0.01"
                    v-model="state[`orderQty-${order.id}`]"
                    class="w-full sm:w-28"
                    @keyup="
                      state[`qty-${order.id}`] = state[`orderQty-${order.id}`]
                    "
                    @change="
                      state[`qty-${order.id}`] = state[`orderQty-${order.id}`]
                    "
                  />
                </div>
                <template #help>
                  <p
                    class="text-xs text-orange-500 -mt-1 font-medium text-right pr-3"
                  >
                    {{
                      `MAX: ${+getSalesInfoByProduct(order.productId).maxOrderQty.toFixed(2)} ${i18n.t("components.product.add." + order.productUnitType)}`
                    }}
                  </p>
                </template>
              </UFormGroup>

              <UFormGroup
                size="lg"
                :label="i18n.t('components.product.add.base-unit')"
                :name="`qty-${order.id}`"
                :ui="{
                  container: 'sm:text-center',
                  label: {
                    wrapper: 'sm:justify-end',
                    base: 'pl-3 sm:w-28',
                  },
                }"
                class="shrink w-full sm:w-36"
              >
                <div class="flex flex-col items-end max relative group">
                  <UInput
                    type="number"
                    :min="0"
                    :step="0.01"
                    v-model="state[`qty-${order.id}`]"
                    class="w-full sm:w-28"
                  />
                </div>
                <template #help>
                  <p
                    class="text-xs text-orange-500 -mt-1 font-medium text-right pr-3"
                  >
                    {{
                      `MAX: ${+getSalesInfoByProduct(order.productId).maxQty.toFixed(2)} ${i18n.t("components.product.add.base-unit")}`
                    }}
                  </p>
                </template>
              </UFormGroup>
            </div>

            <div class="flex flex-col gap-2">
              <UFormGroup
                size="lg"
                :label="i18n.t('components.sales.sale.price')"
                :name="`price-${order.id}`"
                :ui="{
                  label: {
                    wrapper: 'sm:justify-center',
                    base: 'px-3 whitespace-nowrap',
                  },
                }"
                class=""
              >
                <p
                  class="max-sm:px-3 sm:text-center text-xl font-medium sm:pt-1"
                >
                  {{
                    (+(!orderUser?.userType ||
                    orderUser?.userType.percentage === 0
                      ? getSalesInfoByProduct(order.productId).averagePrice
                      : getSalesInfoByProduct(order.productId)
                          .averageSellingPrice *
                        (1 + +orderUser?.userType.percentage / 100))).toFixed(2)
                  }}
                  €
                </p>
              </UFormGroup>

              <UFormGroup
                size="lg"
                :label="i18n.t('components.sales.sale.total-price')"
                :name="`total-${order.id}`"
                :ui="{
                  label: {
                    wrapper: 'sm:justify-center',
                    base: 'px-3 whitespace-nowrap',
                  },
                }"
                class="mt-9"
              >
                <p
                  class="max-sm:px-3 sm:text-center text-xl font-medium sm:pt-1"
                >
                  {{
                    (
                      +(state[`qty-${order.id}`] || 0) *
                      +(!orderUser?.userType ||
                      orderUser?.userType.percentage === 0
                        ? getSalesInfoByProduct(order.productId).averagePrice
                        : getSalesInfoByProduct(order.productId)
                            .averageSellingPrice *
                          (1 + +orderUser?.userType.percentage / 100))
                    ).toFixed(2)
                  }}
                  €
                </p>
              </UFormGroup>
            </div>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.sales.sale.comment')"
              :name="`comment-${order.id}`"
              :ui="{
                container: 'sm:text-center',
                label: {
                  wrapper: 'sm:justify-end',
                  base: 'pl-3 w-full',
                },
              }"
              class="shrink w-full sm:w-1/4 col-span-2 self-center"
            >
              <div class="flex flex-col items-end max">
                <UInput
                  :min="0"
                  v-model="state[`comment-${order.id}`]"
                  class="w-full"
                />
              </div>
            </UFormGroup>
          </div>

          <div v-if="totalPrice" class="pt-2 pb-3 text-right">
            <h6 class="text-3xl font-medium">
              <span class="text-xl">
                {{ i18n.t("components.purchase.add.total-price") }}:
              </span>
              {{ totalPrice.toFixed(2) }} €
            </h6>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <UButton
              type="button"
              size="lg"
              color="gray"
              variant="ghost"
              @click="isOpen = false"
            >
              {{ i18n.t("components.sales.sale.close") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              color="red"
              type="button"
              :loading="loading"
              @click="onCancel"
            >
              {{ i18n.t("components.sales.sale.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.sales.sale.finish") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
