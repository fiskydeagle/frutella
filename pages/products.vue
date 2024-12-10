<script setup lang="ts">
import { format } from "date-fns";
import { useProduct } from "~/composables/useProduct";
import { type Product } from "~/types";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.products"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.products"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "admin"],
});

const {
  products,
  getProducts,
  addProduct,
  updateProduct,
  deactivateProduct,
  restoreProduct,
  deleteProduct,
} = useProduct();
await getProducts();

const columns = [
  {
    key: "id",
    label: i18n.t("pages.products.id"),
  },
  {
    key: "name",
    label: i18n.t("pages.products.name"),
  },
  {
    key: "image",
    label: i18n.t("pages.products.image"),
  },
  {
    key: "unitType",
    label: i18n.t("pages.products.unit-type"),
  },
  {
    key: "createdAt",
    label: i18n.t("pages.products.created-at"),
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.products.updated-at"),
  },
  {
    key: "createdBy",
    label: i18n.t("pages.products.created-by"),
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.products.updated-by"),
  },
  {
    label: "",
    key: "actions",
    class: "w-1",
  },
];

const selectedColumns = ref([...columns]);

const productsRows = computed(() => {
  return products.value?.map((product) => {
    const actions = [
      {
        event: "update",
        label: i18n.t("pages.products.update"),
        icon: "ph:pencil-duotone",
      },
    ];

    if (!product.deletedAt) {
      actions.push({
        event: "deactivate",
        label: i18n.t("pages.products.deactivate"),
        icon: "ph:eye-slash-duotone",
      });
    } else {
      actions.push({
        event: "restore",
        label: i18n.t("pages.products.restore"),
        icon: "ph:eye-duotone",
      });
    }

    actions.push({
      event: "delete",
      label: i18n.t("pages.products.delete"),
      icon: "ph:trash-duotone",
    });

    return {
      id: product.id,
      name: product.name,
      image: product.image,
      unitType: product.unitType,
      createdAt: format(new Date(product.createdAt), "dd.MM.yyyy"),
      updatedAt: format(new Date(product.updatedAt), "dd.MM.yyyy"),
      createdBy: product.createdByUser
        ? `${product.createdByUser.firstName} ${product.createdByUser.lastName}`
        : "-",
      updatedBy: product.updatedByUser
        ? `${product.updatedByUser.firstName} ${product.updatedByUser.lastName}`
        : "-",
      deletedAt: product.deletedAt,
      actions,
    };
  });
});

const productAddModal = ref<boolean>(false);
const productAddLoading = ref<boolean>(false);
const addProductAction = () => {
  productAddModal.value = true;
};
const onAddProduct = async (state: any) => {
  productAddLoading.value = true;

  if (await addProduct(state)) {
    productAddModal.value = false;
  }

  productAddLoading.value = false;
};
const addProductClose = () => {
  productAddModal.value = false;
};

const productToUpdate = ref<Product | null>(null);
const productUpdateModal = ref<boolean>(false);
const productUpdateLoading = ref<boolean>(false);
const updateProductAction = (row: any) => {
  productToUpdate.value = row;
  productUpdateModal.value = true;
};
const onUpdateProduct = async (state: any) => {
  productUpdateLoading.value = true;

  if (await updateProduct(state)) {
    productUpdateModal.value = false;
    setTimeout(() => {
      productToUpdate.value = null;
    }, 400);
  }

  productUpdateLoading.value = false;
};
const updateProductClose = () => {
  productUpdateModal.value = false;
};

const action = async (event: string, row: any) => {
  switch (event) {
    case "update":
      updateProductAction(row);
      break;
    case "deactivate":
      await deactivateProduct(row.id);
      break;
    case "restore":
      await restoreProduct(row.id);
      break;
    case "delete":
      await deleteProduct(row.id);
      break;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.products.products") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex justify-end order-1 sm:order-3">
          <UButton size="lg" type="button" @click="addProductAction">
            {{ i18n.t("pages.products.add-product") }}
          </UButton>
        </div>
        <div class="order-2 flex">
          <USelectMenu
            v-model="selectedColumns"
            :options="columns.filter((columns) => columns.key !== 'actions')"
            size="lg"
            multiple
            placeholder="Columns"
            class="w-full sm:w-48 max-w-full"
          />
        </div>
      </div>
    </div>
    <UTable
      :columns="selectedColumns"
      :rows="productsRows"
      class="frutella-table"
    >
      <template #unitType-data="{ row }">
        <span class="capitalize">
          {{ i18n.t("components.product.add." + row.unitType) }}
        </span>
      </template>

      <template #image-data="{ row }">
        <div class="flex justify-start" v-if="row.image">
          <UPopover mode="hover" class="">
            <img
              :src="row.image"
              class="w-auto h-10 rounded"
              alt="product image"
            />
            <template #panel>
              <div class="p-2">
                <img
                  :src="row.image"
                  class="w-auto h-auto max-h-60 rounded"
                  alt="product image"
                />
              </div>
            </template>
          </UPopover>
        </div>
      </template>

      <template #actions-data="{ row }">
        <span
          v-if="row.deletedAt"
          class="absolute -z-10 top-0 right-0 w-full h-full bg-red-500 bg-opacity-20"
        ></span>
        <div v-if="row.actions && row.actions.length">
          <UPopover
            class="flex justify-end [&>*]:block [&>*]:w-auto"
            :popper="{ placement: 'bottom-end' }"
          >
            <button
              class="flex justify-center items-center rounded text-neutral-500 hover:text-neutral-700"
            >
              <UIcon name="fe:elipsis-v" class="text-3xl -my-2 -mx-1" />
            </button>
            <template #panel="{ close }">
              <div class="flex flex-col rounded-2xl shadow-shadow-lg px-3 py-2">
                <button
                  v-for="actionItem in row.actions"
                  :key="'action-btn-' + actionItem.event"
                  type="button"
                  class="py-2 pr-6 pl-0 body-1 text-left flex gap-2 group/action"
                  @click.prevent="
                    close();
                    action(actionItem.event, row);
                  "
                >
                  <Icon
                    :name="actionItem.icon"
                    size="20"
                    class="block text-neutral-500 group-hover/action:text-neutral-700"
                  />
                  {{ actionItem.label }}
                </button>
              </div>
            </template>
          </UPopover>
        </div>
      </template>
    </UTable>

    <ProductAdd
      :is-modal-open="productAddModal"
      :loading="productAddLoading"
      @on-close="addProductClose"
      @on-submit="onAddProduct"
    />

    <ProductUpdate
      v-if="productToUpdate"
      :product="productToUpdate"
      :is-modal-open="productUpdateModal"
      :loading="productUpdateLoading"
      @on-close="updateProductClose"
      @on-submit="onUpdateProduct"
    />
  </div>
</template>
<style lang="postcss">
.frutella-table tr {
  @apply relative;
}
</style>
