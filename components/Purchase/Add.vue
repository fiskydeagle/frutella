<script setup lang="ts">
import { type InferType, object, number, string } from "yup";
import { type Purchase, type PurchaseState } from "~/types";
import type { FormSubmitEvent } from "#ui/types";
import { useSupplier } from "~/composables/useSupplier";
import { useUtils } from "~/composables/useUtils";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  currentPurchases: Purchase[];
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", purchases: PurchaseState[]): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { findPercentage } = useUtils();
const { suppliers, getSuppliers } = useSupplier();

const schema = computed(() => {
  let ob: any = {};

  if (props.currentPurchases) {
    for (const purchases of props.currentPurchases) {
      const orderQtyKey = `orderQty-${purchases.productId}-${purchases.id}-${purchases.splitId}`;
      const qtyKey = `qty-${purchases.productId}-${purchases.id}-${purchases.splitId}`;
      const priceKey = `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`;
      const sellingPriceKey = `sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`;
      const supplierKey = `supplier-${purchases.productId}-${purchases.id}-${purchases.splitId}`;

      ob[orderQtyKey] = number()
        .transform((value, originalValue) => {
          return originalValue === "" ? null : value; //
        })
        .nullable()
        .optional()
        .moreThan(-1, "Quantity must be greater or equal to 0");

      ob[qtyKey] = number()
        .transform((value, originalValue) => {
          return originalValue === "" ? null : value; //
        })
        .nullable()
        .optional()
        .moreThan(-1, "Quantity must be greater or equal to 0")
        .test("qty-required", "Required", function (value) {
          const orderQty = this.parent[orderQtyKey];
          const hasOrderQty =
            orderQty !== null && orderQty !== undefined && orderQty !== 0;

          if (hasOrderQty) {
            return value !== null && value !== undefined && value !== 0;
          }

          return true;
        });

      ob[priceKey] = number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .optional()
        .moreThan(0, "Price must be greater than 0");

      ob[sellingPriceKey] = number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .moreThan(0, "Selling Price must be greater than 0")
        .test("selling-price-required", "Required", function (value) {
          const qty = this.parent[qtyKey];
          const price = this.parent[priceKey];
          const hasQty = qty !== null && qty !== undefined && qty !== 0;
          const hasPrice = price !== null && price !== undefined && price !== 0;

          if (hasQty && hasPrice) {
            return value !== null && value !== undefined && value !== 0;
          }

          return true; // Not required if both qty and price are empty
        });

      ob[supplierKey] = string()
        .nullable()
        .test("supplier-required", "Required", function (value) {
          const qty = this.parent[qtyKey];
          const price = this.parent[priceKey];
          const hasQty = qty !== null && qty !== undefined && qty !== 0;
          const hasPrice = price !== null && price !== undefined && price !== 0;

          if (hasQty && hasPrice) {
            return value !== null && value !== undefined && value.trim() !== "";
          }

          return true; // Not required if both qty and price are empty
        });
    }
  }

  return object(ob);
});

type Schema = InferType<typeof schema.value>;

const state = ref<any>({});

const fillState = () => {
  state.value = {};

  if (props.currentPurchases) {
    for (const purchases of props.currentPurchases) {
      let supplier = "";
      if (purchases.supplierId) {
        const foundSupplier = suppliers.value?.find(
          (item) => item.id == purchases.supplierId,
        );
        if (foundSupplier) {
          supplier = foundSupplier.company;
        }
      }

      state.value[
        `orderQty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
      ] = ref(purchases.orderQty || purchases.totalOrderQty);
      state.value[
        `qty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
      ] = ref(purchases.qty || purchases.totalOrderQty);
      state.value[
        `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`
      ] = ref(purchases.price || undefined);
      state.value[
        `sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`
      ] = ref(purchases.sellingPrice || undefined);
      state.value[
        `supplier-${purchases.productId}-${purchases.id}-${purchases.splitId}`
      ] = ref(supplier);
      state.value[
        `supplierOption-${purchases.productId}-${purchases.id}-${purchases.splitId}`
      ] = ref();
    }
  }
};

const addItemsToState = (purchase: Purchase, index: number) => {
  const count = props.currentPurchases.filter(
    (item) => item.productId === purchase.productId,
  ).length;
  const key = `${purchase.productId}-null-${count}`;
  state.value[`orderQty-${key}`] = ref("1");
  state.value[`qty-${key}`] = ref("1");
  state.value[`price-${key}`] = ref();
  state.value[`sellingPrice-${key}`] = ref();
  state.value[`supplier-${key}`] = ref("");
  state.value[`supplierOption-${key}`] = ref();

  const newPurchase = {
    ...purchase,
    id: null,
    orderQty: null,
    qty: null,
    supplierId: null,
    splitId: count,
  };

  props.currentPurchases.splice(index + 1, 0, newPurchase);
};

const removeItemsFromState = (purchase: Purchase, index: number) => {
  props.currentPurchases.splice(index, 1);

  const key = `${purchase.productId}-null-${purchase.splitId}`;
  delete state.value[`orderQty-${key}`];
  delete state.value[`qty-${key}`];
  delete state.value[`price-${key}`];
  delete state.value[`sellingPrice-${key}`];
  delete state.value[`supplier-${key}`];
  delete state.value[`supplierOption-${key}`];
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
      await getSuppliers(true);

      fillState();
    }
  },
);

const totalPrice = computed(() => {
  let total = 0;
  Object.keys(state.value).forEach((item) => {
    if (item.includes("qty-")) {
      const stateId = item.replace("qty-", "");

      if (state.value[`qty-${stateId}`] && +state.value[`price-${stateId}`]) {
        total +=
          +state.value[`qty-${stateId}`] * +state.value[`price-${stateId}`];
      }
    }
  });
  return total;
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const purchases: PurchaseState[] = [];

  Object.keys(state.value).forEach((item) => {
    if (item.includes("qty-")) {
      const stateId = item.replace("qty-", "");
      const ids = stateId.split("-");

      purchases.push({
        purchaseId: !["null", "undefined"].includes(ids[1])
          ? +ids[1]
          : undefined,
        productId: +ids[0],
        orderQty: state.value[`price-${stateId}`]
          ? +state.value[`orderQty-${stateId}`] || undefined
          : undefined,
        qty: state.value[`price-${stateId}`]
          ? +state.value[`qty-${stateId}`] || undefined
          : undefined,
        price: +state.value[`price-${stateId}`] || undefined,
        sellingPrice: +state.value[`sellingPrice-${stateId}`] || undefined,
        supplierName: state.value[`supplier-${stateId}`] || undefined,
      });
    }
  });

  emits("onSubmit", purchases);
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
              {{ i18n.t("components.purchase.add.purchase") }}
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
            v-if="!currentPurchases || !currentPurchases.length"
            class="text-xl text-center"
          >
            {{ i18n.t("components.purchase.add.no-orders") }}
          </p>
          <div
            v-else
            v-for="(purchases, index) in currentPurchases"
            :key="`purchases-${purchases.productId}-${purchases.id}-${purchases.splitId}`"
            class="flex max-sm:grid max-sm:grid-cols-2 gap-3 justify-between pt-2 pb-3 max-sm:bg-neutral-100 max-sm:border !border-neutral-200 max-sm:p-3.5 max-sm:rounded-md"
          >
            <div class="flex shrink-0 items-center gap-2 col-span-2 sm:w-1/5">
              <UPopover mode="hover" class="flex shrink-0">
                <div class="bg-white mt-1 border border-gray-300 rounded p-1">
                  <img
                    :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${purchases.product.image}`"
                    class="w-14 h-14 object-cover"
                    alt="product image"
                  />
                </div>
                <template #panel>
                  <div class="p-2">
                    <img
                      :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${purchases.product.image}`"
                      class="w-auto h-auto max-h-60 rounded"
                      alt="product image"
                    />
                  </div>
                </template>
              </UPopover>
              <label
                class="text-lg font-medium text-gray-700 dark:text-gray-200"
              >
                {{ purchases.product.name }}
                <span class="block text-sm">
                  ({{ purchases.totalOrderQty }}
                  {{
                    i18n.t(
                      "components.product.add." + purchases.product.unitType,
                    )
                  }})
                </span>
              </label>
            </div>

            <div class="flex flex-col justify-between gap-2">
              <UFormGroup
                size="lg"
                :label="
                  i18n.t('components.product.add.' + purchases.product.unitType)
                "
                :name="`orderQty-${purchases.productId}-${purchases.id}-${purchases.splitId}`"
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
                    v-model="
                      state[
                        `orderQty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                      ]
                    "
                    class="w-full sm:w-28"
                    @keyup="
                      state[
                        `qty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                      ] =
                        state[
                          `orderQty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ]
                    "
                    @change="
                      state[
                        `qty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                      ] =
                        state[
                          `orderQty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ]
                    "
                  />

                  <div
                    class="absolute max-sm:!static z-10 pt-0 max-sm:!pt-1 group-hover:pt-1 opacity-0 group-hover:opacity-100 max-sm:opacity-100 invisible group-hover:visible max-sm:visible top-0 group-hover:top-full max-sm:top-full right-0 transition-all ease-in-out"
                  >
                    <div class="flex gap-2 p-2 rounded bg-white shadow-md">
                      <UButton
                        v-if="!purchases.splitId"
                        class="justify-center"
                        size="sm"
                        type="button"
                        @click="addItemsToState(purchases, index)"
                      >
                        {{ i18n.t("components.purchase.add.split") }}
                      </UButton>

                      <UButton
                        v-else
                        class="justify-center"
                        size="sm"
                        type="button"
                        color="red"
                        @click="removeItemsFromState(purchases, index)"
                      >
                        {{ i18n.t("components.purchase.add.remove") }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </UFormGroup>

              <UFormGroup
                size="lg"
                :label="i18n.t('components.product.add.base-unit')"
                :name="`qty-${purchases.productId}-${purchases.id}-${purchases.splitId}`"
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
                    v-model="
                      state[
                        `qty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                      ]
                    "
                    class="w-full sm:w-28"
                  />
                </div>
                <template
                  v-if="
                    findPercentage(
                      +(
                        state[
                          `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ] || 0
                      ),
                      +(
                        state[
                          `sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ] || 0
                      ),
                    )
                  "
                  #help
                >
                  <p
                    class="text-xs text-orange-500 -mt-1 font-medium text-right pr-3 max-sm:-mb-5"
                  >
                    &nbsp;
                  </p>
                </template>
              </UFormGroup>
            </div>

            <div class="flex flex-col justify-between gap-2">
              <UFormGroup
                size="lg"
                :label="i18n.t('components.purchase.add.price')"
                :name="`price-${purchases.productId}-${purchases.id}-${purchases.splitId}`"
                :ui="{
                  container: 'sm:text-center',
                  label: {
                    wrapper: 'sm:justify-end',
                    base: 'pl-3 sm:w-28',
                  },
                }"
                class="shrink w-full sm:w-36"
              >
                <div class="flex flex-col items-end max">
                  <UInput
                    type="number"
                    :min="0"
                    :step="0.01"
                    v-model="
                      state[
                        `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                      ]
                    "
                    class="w-full sm:w-28"
                    @keyup="
                      state[
                        `sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                      ] =
                        state[
                          `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ]
                    "
                    @change="
                      state[
                        `sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                      ] =
                        state[
                          `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ]
                    "
                  >
                    <template #trailing>
                      <span class="text-gray-500 dark:text-gray-400 text-base">
                        €
                      </span>
                    </template>
                  </UInput>
                </div>

                <template #help>
                  <p
                    class="text-xs text-orange-500 -mt-1 font-medium text-right pr-3 max-sm:-mb-5"
                  >
                    {{ i18n.t("components.purchase.add.total-price") }}:
                    <span class="inline-block">
                      {{
                        (
                          +(
                            state[
                              `qty-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                            ] || 0
                          ) *
                          +(
                            state[
                              `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                            ] || 0
                          )
                        ).toFixed(2)
                      }}
                      €
                    </span>
                  </p>
                </template>
              </UFormGroup>

              <UFormGroup
                size="lg"
                :label="i18n.t('components.purchase.add.selling-price')"
                :name="`sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`"
                :ui="{
                  container: 'sm:text-center',
                  label: {
                    wrapper: 'sm:justify-end',
                    base: 'pl-3 sm:w-28',
                  },
                }"
                class="shrink w-full sm:w-36"
              >
                <div class="flex flex-col items-end max">
                  <UInput
                    type="number"
                    :min="0"
                    :step="0.01"
                    v-model="
                      state[
                        `sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                      ]
                    "
                    class="w-full sm:w-28"
                  >
                    <template #trailing>
                      <span class="text-gray-500 dark:text-gray-400 text-base">
                        €
                      </span>
                    </template>
                  </UInput>
                </div>
                <template
                  v-if="
                    findPercentage(
                      +(
                        state[
                          `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ] || 0
                      ),
                      +(
                        state[
                          `sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ] || 0
                      ),
                    )
                  "
                  #help
                >
                  <p
                    class="text-xs text-orange-500 -mt-1 font-medium text-right pr-3 max-sm:-mb-5"
                  >
                    {{ i18n.t("components.purchase.add.percentage") }}:
                    <span class="inline-block">
                      {{
                        (
                          findPercentage(
                            +(
                              state[
                                `price-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                              ] || 0
                            ),
                            +(
                              state[
                                `sellingPrice-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                              ] || 0
                            ),
                          ) - 100
                        ).toFixed(2)
                      }}
                      %
                    </span>
                  </p>
                </template>
              </UFormGroup>
            </div>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.purchase.add.supplier')"
              :name="`supplier-${purchases.productId}-${purchases.id}-${purchases.splitId}`"
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
                <UInputMenu
                  v-model:query="
                    state[
                      `supplier-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                    ]
                  "
                  v-model="
                    state[
                      `supplierOption-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                    ]
                  "
                  :options="
                    suppliers && suppliers.length
                      ? suppliers.map((supplier) => supplier.company)
                      : []
                  "
                  :placeholder="
                    i18n.t('components.purchase.add.select-supplier')
                  "
                  class="w-full"
                  @change="
                    state[
                      `supplier-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                    ] = $event
                  "
                >
                  <template #option-empty="{ query }">
                    <span class="text-gray-950">
                      {{ i18n.t("components.purchase.add.new-supplier") }}
                      <q class="font-medium">{{ query }}</q>
                    </span>
                  </template>
                  <template #trailing>
                    <button
                      type="button"
                      class="flex"
                      @click="
                        state[
                          `supplier-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ] = '';
                        state[
                          `supplierOption-${purchases.productId}-${purchases.id}-${purchases.splitId}`
                        ] = undefined;
                      "
                    >
                      <Icon
                        name="heroicons:chevron-down-20-solid"
                        size="20"
                        class="flex-shrink-0 text-gray-400 dark:text-gray-500"
                      />
                    </button>
                  </template>
                </UInputMenu>
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
              {{ i18n.t("components.purchase.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.purchase.add.purchase") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
