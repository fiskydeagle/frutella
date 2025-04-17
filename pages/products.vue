<script setup lang="ts">
import { format } from "date-fns";
import { useProduct } from "~/composables/useProduct";
import { type Product } from "~/types";

const i18n = useI18n();
const route = useRoute();

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
  middleware: ["auth", "verified", "admin"],
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
    isVisible: false,
    sortable: true,
  },
  {
    key: "name",
    label: i18n.t("pages.products.name"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "image",
    label: i18n.t("pages.products.image"),
    isVisible: true,
  },
  {
    key: "unitTypeCol",
    label: i18n.t("pages.products.unit-type"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "createdAt",
    label: i18n.t("pages.products.created-at"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.products.updated-at"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "createdBy",
    label: i18n.t("pages.products.created-by"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.products.updated-by"),
    isVisible: false,
    sortable: true,
  },
  {
    label: "",
    key: "actions",
    class: "w-1",
    isVisible: true,
  },
];

const searchWord = ref<string>();

const productsRows = computed(() => {
  return products.value
    ?.map((product) => {
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

      const cssClass = product.deletedAt ? "!bg-red-500 !bg-opacity-20" : "";

      return {
        id: product.id,
        name: product.name,
        image: product.image,
        unitType: product.unitType,
        unitTypeCol: i18n.t("components.product.add." + product.unitType),
        createdAt: new Date(product.createdAt).getTime(),
        createdAtDate: format(new Date(product.createdAt), "dd.MM.yyyy"),
        updatedAt: new Date(product.updatedAt).getTime(),
        updatedAtDate: format(new Date(product.updatedAt), "dd.MM.yyyy"),
        createdBy: product.createdByUser
          ? `${product.createdByUser.firstName} ${product.createdByUser.lastName}`
          : "-",
        updatedBy: product.updatedByUser
          ? `${product.updatedByUser.firstName} ${product.updatedByUser.lastName}`
          : "-",
        deletedAt: product.deletedAt,
        class: cssClass,
        actions,
      };
    })
    .filter((order) => {
      if (!searchWord.value) return true;
      return (
        order.name.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.unitTypeCol
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.createdAtDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.updatedAtDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.createdBy
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.updatedBy?.toLowerCase().includes(searchWord.value?.toLowerCase())
      );
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

const action = async (event: { event: string; row: any }) => {
  switch (event.event) {
    case "update":
      updateProductAction(event.row);
      break;
    case "deactivate":
      await deactivateProduct(event.row.id);
      break;
    case "restore":
      await restoreProduct(event.row.id);
      break;
    case "delete":
      await deleteProduct(event.row.id);
      break;
  }
};

onMounted(() => {
  if (route.query.modal) {
    addProductAction();
  }
});
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.products.products") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-between items-end gap-2">
        <UFormGroup size="lg" :label="i18n.t('common.search')">
          <UInput v-model="searchWord" />
        </UFormGroup>

        <UButton size="lg" type="button" @click="addProductAction">
          {{ i18n.t("pages.products.add-product") }}
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-products'"
        :columns="columns"
        :rows="productsRows"
        @on-action-click="action"
        @select="action({ event: 'update', row: $event })"
      >
        <template #image-data="{ row }">
          <div class="flex justify-start" v-if="row.image">
            <UPopover mode="hover" class="">
              <img
                :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${row.image}`"
                class="w-10 h-10 rounded object-cover border border-gray-300"
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
          </div>
        </template>

        <template #createdAt-data="{ row }">
          {{ row.createdAtDate }}
        </template>

        <template #updatedAt-data="{ row }">
          {{ row.updatedAtDate }}
        </template>
      </DataTable>
    </ClientOnly>

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
