<script setup lang="ts">
import { type Purchase, type User } from "~/types";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  currentPurchases: Purchase[];
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
            {{ i18n.t("components.purchase.cart.purchases") }}
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
        class="flex flex-col sm:divide-y max-sm:gap-3.5 divide-gray-100 dark:divide-gray-800 -mt-2 -mb-3"
      >
        <div
          v-for="purchase in currentPurchases"
          :key="'purchase-' + purchase.id"
          class="flex max-sm:grid max-sm:grid-cols-2 gap-3 justify-between items-start pt-2 pb-3 max-sm:bg-neutral-100 max-sm:border !border-neutral-200 max-sm:p-3.5 max-sm:rounded-md"
        >
          <div
            class="flex shrink-0 items-center gap-2 col-span-2 w-full sm:w-1/5"
          >
            <UPopover mode="hover" class="flex shrink-0">
              <div class="bg-white mt-1 border border-gray-300 rounded p-1">
                <img
                  :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${purchase.productImage}`"
                  class="w-14 h-14 object-cover"
                  alt="product image"
                />
              </div>
              <template #panel>
                <div class="p-2">
                  <img
                    :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${purchase.productImage}`"
                    class="w-auto h-auto max-h-60 rounded"
                    alt="product image"
                  />
                </div>
              </template>
            </UPopover>
            <label class="text-lg font-medium text-gray-700 dark:text-gray-200">
              {{ purchase.productName }}
            </label>
          </div>

          <UFormGroup
            size="lg"
            :label="
              i18n.t('components.product.add.' + purchase.productUnitType)
            "
            :name="`qty-${purchase.productId}-${purchase.id}`"
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
                v-model="purchase.qty!"
                :disabled="true"
                class="w-full sm:w-28"
              />
            </div>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.purchase.add.price')"
            :name="`price-${purchase.productId}-${purchase.id}`"
            :ui="{
              container: 'sm:text-center',
              label: {
                wrapper: 'sm:justify-end',
                base: 'pl-3 sm:w-28',
              },
            }"
            class="shrink w-full sm:w-1/5"
          >
            <div class="flex flex-col items-end max">
              <UInput
                type="number"
                v-model="purchase.price!"
                :disabled="true"
                class="w-full sm:w-28"
              >
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-base">
                    €
                  </span>
                </template>
              </UInput>
            </div>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.purchase.add.total-price')"
            :name="`total-${purchase.productId}-${purchase.id}`"
            :ui="{
              label: {
                wrapper: 'sm:justify-center',
                base: 'px-3 whitespace-nowrap',
              },
            }"
            class="shrink"
          >
            <p class="max-sm:px-3 sm:text-center text-xl font-medium sm:pt-1">
              {{ (+(purchase.qty || 0) * +(purchase.price || 0)).toFixed(2) }} €
            </p>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.purchase.add.supplier')"
            :name="`supplier-${purchase.productId}-${purchase.id}`"
            :ui="{
              container: 'sm:text-center',
              label: {
                wrapper: 'sm:justify-end',
                base: 'pl-3 w-full',
              },
            }"
            class="shrink w-full sm:w-1/4"
          >
            <div class="flex flex-col items-end max">
              <UInput
                type="text"
                v-model="purchase.supplierName!"
                :disabled="true"
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
            {{ (+totalPrice).toFixed(2) }} €
          </h6>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <UButton type="button" size="lg" @click="isOpen = false">
            {{ i18n.t("components.order.cart.close") }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
