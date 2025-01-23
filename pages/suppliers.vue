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
  middleware: ["auth", "verified", "employee"],
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
    sortable: true,
  },
  {
    key: "company",
    label: i18n.t("pages.suppliers.company"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "image",
    label: i18n.t("pages.suppliers.image"),
    isVisible: true,
  },
  {
    key: "name",
    label: i18n.t("pages.suppliers.name"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "cityCol",
    label: i18n.t("pages.suppliers.city"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "address",
    label: i18n.t("pages.suppliers.address"),
    isVisible: true,
    sortable: true,
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
    sortable: true,
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.suppliers.updated-at"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "createdBy",
    label: i18n.t("pages.suppliers.created-by"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.suppliers.updated-by"),
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

const suppliersRows = computed(() => {
  return suppliers.value
    ?.map((supplier) => {
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

      const cssClass = supplier.deletedAt ? "!bg-red-500 !bg-opacity-20" : "";

      return {
        id: supplier.id,
        company: supplier.company,
        image: supplier.image,
        firstName: supplier.firstName,
        lastName: supplier.lastName,
        name:
          supplier.firstName || supplier.lastName
            ? `${supplier.firstName || ""} ${supplier.lastName || ""}`
            : "",
        city: supplier.city,
        cityCol: kosovoCities.find((city) => city.code === supplier.city)?.name,
        address: supplier.address,
        tel: supplier.tel,
        createdAt: new Date(supplier.createdAt).getTime(),
        createdAtDate: format(new Date(supplier.createdAt), "dd.MM.yyyy"),
        updatedAt: new Date(supplier.updatedAt).getTime(),
        updatedAtDate: format(new Date(supplier.updatedAt), "dd.MM.yyyy"),
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
    })
    .filter((order) => {
      if (!searchWord.value) return true;
      return (
        order.company
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.name.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.cityCol
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.address
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.tel?.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
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
      <div class="flex flex-wrap justify-between items-end gap-2">
        <UFormGroup size="lg" :label="i18n.t('common.search')">
          <UInput v-model="searchWord" />
        </UFormGroup>

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

        <template #tel-data="{ row }">
          <a
            v-if="row.tel"
            @click.stop
            class="p-3 -m-3"
            :href="`tel:${row.tel}`"
          >
            {{ row.tel }}
          </a>
        </template>

        <template #createdAt-data="{ row }">
          {{ row.createdAtDate }}
        </template>

        <template #updatedAt-data="{ row }">
          {{ row.updatedAtDate }}
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
