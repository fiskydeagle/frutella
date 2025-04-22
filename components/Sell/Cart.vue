<script setup lang="ts">
import { type Order } from "~/types";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  currentOrders: Order[];
  date: string | number;
  totalPrice?: string | number;
};

type EmitType = {
  (event: "onClose"): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const isOpen = computed({
  get: () => props.isModalOpen,
  set: (value) => {
    if (!value) emits("onClose");
  },
});
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-3xl',
    }"
  >
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
            {{ date }}
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
            <label class="text-lg font-medium text-gray-700 dark:text-gray-200">
              {{ order.productName }}
            </label>
          </div>

          <div class="flex flex-col justify-between gap-2">
            <UFormGroup
              size="lg"
              :label="i18n.t('components.product.add.' + order.productUnitType)"
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
                  :disabled="true"
                  :model-value="order.orderQty || 0"
                  class="w-full sm:w-28"
                />
              </div>
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
                  :disabled="true"
                  :model-value="order.qty || 0"
                  class="w-full sm:w-28"
                />
              </div>
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
              <p class="max-sm:px-3 sm:text-center text-xl font-medium sm:pt-1">
                {{ (order.salePrice || 0).toFixed(2) }} €
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
              class="mt-3"
            >
              <p class="max-sm:px-3 sm:text-center text-xl font-medium sm:pt-1">
                {{ (+(order.salePrice || 0) * +(order.qty || 0)).toFixed(2) }} €
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
            <div class="max-sm:px-3 text-left">
              <p class="block font-medium sm:pt-1">
                {{ order.comment }}
              </p>
            </div>
          </UFormGroup>
        </div>

        <div
          v-if="totalPrice && totalPrice !== '-'"
          class="pt-2 pb-3 text-right"
        >
          <h6 class="text-3xl font-medium">
            <span class="text-xl">
              {{ i18n.t("components.purchase.add.total-price") }}:
            </span>
            {{ totalPrice }}
          </h6>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <UButton
            class="justify-center"
            size="lg"
            type="button"
            @click="isOpen = false"
          >
            {{ i18n.t("components.sales.sale.close") }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
