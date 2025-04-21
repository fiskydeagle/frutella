<script setup lang="ts">
import { type InferType, object, string, array, number } from "yup";
import { type Order, type OrderState, type User } from "~/types";
import type { FormSubmitEvent } from "#ui/types";
import { useProduct } from "~/composables/useProduct";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  currentOrders: Order[];
  loading: boolean;
  orderUser?: User;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", orders: OrderState[]): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { products, getProducts } = useProduct();

const schema = computed(() => {
  let ob: any = {};

  if (products.value) {
    for (const product of products.value) {
      ob[`qty-${product.id}`] = number()
        .transform((value, originalValue) => {
          return originalValue === "" ? null : value; //
        })
        .integer("Quantity must be an integer")
        .nullable()
        .moreThan(-1, "Quantity must be greater or equal to 0");
    }
  }

  return object(ob);
});

type Schema = InferType<typeof schema.value>;

const state = ref<any>({});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const orders: OrderState[] = [];

  Object.keys(state.value).forEach((item) => {
    const pId = +item.replace("qty-", "");
    const currentOrder = props.currentOrders.find(
      (item) => item.productId === pId,
    );
    orders.push({
      productId: pId,
      qty: +state.value[item] || undefined,
      orderId: currentOrder ? currentOrder.id : undefined,
    });
  });

  emits("onSubmit", orders);
};

const isOpen = computed({
  get: () => props.isModalOpen,
  set: (value) => {
    if (!value) emits("onClose");
  },
});

const hasQty = (productId: number) => {
  const currentOrder = props.currentOrders.find(
    (item) => item.productId === productId,
  );

  return currentOrder && currentOrder.orderQty;
};

watch(
  () => isOpen.value,
  async (isOpen) => {
    if (!isOpen) {
      state.value = {};
    } else {
      await getProducts(true);

      if (products.value) {
        for (const product of products.value) {
          const currentOrder = props.currentOrders.find(
            (item) => item.productId === product.id,
          );
          state.value[`qty-${product.id}`] = ref(
            currentOrder ? currentOrder.orderQty : undefined,
          );
        }
      }
    }
  },
);
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
              {{ i18n.t("components.order.add.order") }}
              <template v-if="orderUser">
                {{ i18n.t("common.for") }}
                <span class="font-medium">{{ orderUser.company }}</span>
              </template>
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
          class="max-sm:flex max-sm:flex-col grid grid-cols-2 sm:divide-y gap-x-5 gap-y-3.5 divide-gray-100 dark:divide-gray-800 -mt-2 -mb-3"
        >
          <div
            v-for="(product, index) in products"
            :key="'product-' + product.id"
            class="flex max-sm:grid max-sm:grid-cols-2 gap-3 justify-between items-end pt-2 max-sm:!pb-4 order-1 max-sm:bg-neutral-100 max-sm:border !border-neutral-200 [&:nth-child(2)]:!border-t-0 max-sm:p-3.5 max-sm:rounded-md"
            :class="hasQty(product.id) ? 'order-1' : 'order-2'"
          >
            <div class="flex shrink-0 items-center gap-2">
              <UPopover mode="hover" class="flex shrink-0">
                <div class="bg-white mt-1 border border-gray-300 rounded p-1">
                  <img
                    :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${product.image}`"
                    class="w-14 h-14 object-cover"
                    alt="product image"
                  />
                </div>
                <template #panel>
                  <div class="p-2">
                    <img
                      :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${product.image}`"
                      class="w-auto h-auto max-h-60 rounded"
                      alt="product image"
                    />
                  </div>
                </template>
              </UPopover>
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-200"
                >{{ product.name }}</label
              >
            </div>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.product.add.' + product.unitType)"
              :name="`qty-${product.id}`"
              :ui="{
                label: {
                  wrapper: 'justify-end',
                  base: 'pl-3 w-28',
                },
              }"
              class="shrink"
            >
              <div class="flex flex-col items-end max">
                <UInput
                  type="number"
                  :min="0"
                  v-model="state[`qty-${product.id}`]"
                  class="w-28"
                />
              </div>
            </UFormGroup>
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
              {{ i18n.t("components.order.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.order.add.order") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
