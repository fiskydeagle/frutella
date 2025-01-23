<script setup lang="ts">
import { type InferType, object, number, string } from "yup";
import { type Order, type User, type SaleState, type Purchase } from "~/types";
import type { FormSubmitEvent } from "#ui/types";
import { useSale } from "~/composables/useSale";
import { format } from "date-fns";

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
        class="flex flex-col divide-y divide-gray-200 dark:divide-gray-800 -mt-2 -mb-3"
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
          class="flex max-sm:flex-col gap-2 justify-between items-start pt-2 pb-3"
        >
          <div class="flex shrink-0 items-center gap-2 w-full sm:w-1/5">
            <UPopover mode="hover" class="flex shrink-0">
              <div>
                <img
                  :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${order.productImage}`"
                  class="w-14 h-14 rounded object-cover border border-gray-300 mt-1"
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

          <UFormGroup
            size="lg"
            :label="i18n.t('components.product.add.' + order.productUnitType)"
            :name="`qty-${order.id}`"
            :ui="{
              container: 'sm:text-center',
              label: {
                wrapper: 'sm:justify-end',
                base: 'pl-3 sm:w-28',
              },
            }"
            class="shrink w-full sm:w-1/5"
          >
            <div class="flex flex-col items-end max relative group">
              <UInput
                type="number"
                :min="0"
                :disabled="true"
                :model-value="order.qty || 0"
                class="w-full sm:w-28"
              />
            </div>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.sales.sale.price')"
            :name="`price-${order.id}`"
            :ui="{
              label: {
                wrapper: 'justify-center',
                base: 'px-3 whitespace-nowrap',
              },
            }"
            class="shrink"
          >
            <p class="sm:text-center text-xl font-medium sm:pt-1">
              {{ (order.salePrice || 0).toFixed(2) }} €
            </p>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.sales.sale.total-price')"
            :name="`total-${order.id}`"
            :ui="{
              label: {
                wrapper: 'justify-center',
                base: 'px-3 whitespace-nowrap',
              },
            }"
            class="shrink"
          >
            <p class="sm:text-center text-xl font-medium sm:pt-1">
              {{ (+(order.salePrice || 0) * +(order.qty || 0)).toFixed(2) }} €
            </p>
          </UFormGroup>

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
            class="shrink w-full sm:w-1/4"
          >
            <div class="text-left">
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
