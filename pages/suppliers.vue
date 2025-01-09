<script setup lang="ts">
import { format } from "date-fns";
import { useSupplier } from "~/composables/useSupplier";
import { type Supplier } from "~/types";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.suppliers"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.suppliers"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "verified", "admin"],
});

const {
  suppliers,

  getSuppliers,
  addSupplier,
  updateSupplier,
  deactivateSupplier,
  restoreSupplier,
  deleteSupplier,
} = useSupplier();
await getSuppliers();

const { kosovoCities } = useUtils();

const columns = [
  {
    key: "id",
    label: i18n.t("pages.suppliers.id"),
    isVisible: false,
  },
  {
    key: "company",
    label: i18n.t("pages.suppliers.company"),
    isVisible: true,
  },
  {
    key: "image",
    label: i18n.t("pages.suppliers.image"),
    isVisible: true,
  },
  {
    key: "firstName",
    label: i18n.t("pages.suppliers.firstName"),
    isVisible: true,
  },
  {
    key: "lastName",
    label: i18n.t("pages.suppliers.lastName"),
    isVisible: true,
  },
  {
    key: "city",
    label: i18n.t("pages.suppliers.city"),
    isVisible: true,
  },
  {
    key: "address",
    label: i18n.t("pages.suppliers.address"),
    isVisible: true,
  },
  {
    key: "tel",
    label: i18n.t("pages.suppliers.tel"),
    isVisible: true,
  },
  {
    key: "createdAt",
    label: i18n.t("pages.suppliers.created-at"),
    isVisible: true,
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.suppliers.updated-at"),
    isVisible: false,
  },
  {
    key: "createdBy",
    label: i18n.t("pages.suppliers.created-by"),
    isVisible: false,
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.suppliers.updated-by"),
    isVisible: false,
  },
  {
    label: "",
    key: "actions",
    class: "w-1",
    isVisible: true,
  },
];

const suppliersRows = computed(() => {
  return suppliers.value?.map((supplier) => {
    const actions = [
      {
        event: "update",
        label: i18n.t("pages.suppliers.update"),
        icon: "ph:pencil-duotone",
      },
    ];

    if (!supplier.deletedAt) {
      actions.push({
        event: "deactivate",
        label: i18n.t("pages.suppliers.deactivate"),
        icon: "ph:eye-slash-duotone",
      });
    } else {
      actions.push({
        event: "restore",
        label: i18n.t("pages.suppliers.restore"),
        icon: "ph:eye-duotone",
      });
    }

    actions.push({
      event: "delete",
      label: i18n.t("pages.suppliers.delete"),
      icon: "ph:trash-duotone",
    });

    const cssClass = supplier.deletedAt ? "bg-red-500 bg-opacity-20" : "";

    return {
      id: supplier.id,
      company: supplier.company,
      image: supplier.image,
      firstName: supplier.firstName,
      lastName: supplier.lastName,
      city: supplier.city,
      address: supplier.address,
      tel: supplier.tel,
      createdAt: format(new Date(supplier.createdAt), "dd.MM.yyyy"),
      updatedAt: format(new Date(supplier.updatedAt), "dd.MM.yyyy"),
      createdBy: supplier.createdByUser
        ? `${supplier.createdByUser.firstName} ${supplier.createdByUser.lastName}`
        : "-",
      updatedBy: supplier.updatedByUser
        ? `${supplier.updatedByUser.firstName} ${supplier.updatedByUser.lastName}`
        : "-",
      deletedAt: supplier.deletedAt,
      class: cssClass,
      actions,
    };
  });
});

const supplierAddModal = ref<boolean>(false);
const supplierAddLoading = ref<boolean>(false);
const addSupplierAction = () => {
  supplierAddModal.value = true;
};

const onAddSupplier = async (state: any) => {
  supplierAddLoading.value = true;

  if (await addSupplier(state)) {
    supplierAddModal.value = false;
  }

  supplierAddLoading.value = false;
};

const addSupplierClose = () => {
  supplierAddModal.value = false;
};

const supplierToUpdate = ref<Supplier | null>(null);
const supplierUpdateModal = ref<boolean>(false);
const supplierUpdateLoading = ref<boolean>(false);
const updateSupplierAction = (row: any) => {
  supplierToUpdate.value = row;
  supplierUpdateModal.value = true;
};
const onUpdateSupplier = async (state: any) => {
  supplierUpdateLoading.value = true;

  if (await updateSupplier(state)) {
    supplierUpdateModal.value = false;
    setTimeout(() => {
      supplierToUpdate.value = null;
    }, 400);
  }

  supplierUpdateLoading.value = false;
};
const updateSupplierClose = () => {
  supplierUpdateModal.value = false;
};

const action = async (event: { event: string; row: any }) => {
  switch (event.event) {
    case "update":
      updateSupplierAction(event.row);
      break;
    case "deactivate":
      await deactivateSupplier(event.row.id);
      break;
    case "restore":
      await restoreSupplier(event.row.id);
      break;
    case "delete":
      await deleteSupplier(event.row.id);
      break;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.suppliers.suppliers") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex justify-end">
        <UButton size="lg" type="button" @click="addSupplierAction">
          {{ i18n.t("pages.suppliers.add-supplier") }}
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-suppliers'"
        :columns="columns"
        :rows="suppliersRows"
        @on-action-click="action"
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

        <template #city-data="{ row }">
          {{ kosovoCities.find((city) => city.code === row.city)?.name }}
        </template>
      </DataTable>
    </ClientOnly>

    <SupplierAdd
      :is-modal-open="supplierAddModal"
      :loading="supplierAddLoading"
      @on-close="addSupplierClose"
      @on-submit="onAddSupplier"
    />

    <SupplierUpdate
      v-if="supplierToUpdate"
      :supplier="supplierToUpdate"
      :is-modal-open="supplierUpdateModal"
      :loading="supplierUpdateLoading"
      @on-close="updateSupplierClose"
      @on-submit="onUpdateSupplier"
    />
  </div>
</template>
