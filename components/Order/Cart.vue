<script setup lang="ts">
import { type Order, type User } from "~/types";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  currentOrders: Order[];
  orderUser?: User;
  date: string | number;
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
      width: 'w-full sm:max-w-md',
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
            {{ i18n.t("components.order.cart.cart") }}
            {{ i18n.t("common.for") }}
            {{ i18n.t("common.date") }}:
            {{ date }}
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
        class="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 -mt-2 -mb-3"
      >
        <div
          v-for="order in currentOrders"
          :key="'order-' + order.id"
          class="flex gap-2 justify-between items-end pt-2 pb-3"
        >
          <div class="flex shrink-0 items-center gap-2">
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
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-200"
              >{{ order.productName }}</label
            >
          </div>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.product.add.' + order.productUnitType)"
            :name="`qty-${order.id}`"
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
                :disabled="true"
                v-model="order.orderQty"
                class="w-28"
              />
            </div>
          </UFormGroup>
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
