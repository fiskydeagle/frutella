<script setup lang="ts">
import { format } from "date-fns";
import { useSystemUsers } from "~/composables/useSystemUsers";
import { type User } from "~/types";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.users"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.users"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "verified", "admin"],
});

const {
  users,
  getUsers,
  addUser,
  updateUser,
  verifyUser,
  deactivateUser,
  restoreUser,
  deleteUser,
} = useSystemUsers();
await getUsers();

const { kosovoCities } = useUtils();

const columns = [
  {
    key: "id",
    label: i18n.t("pages.users.id"),
    isVisible: false,
  },
  {
    key: "sort",
    label: i18n.t("pages.users.sort"),
    isVisible: false,
  },
  {
    key: "company",
    label: i18n.t("pages.users.company"),
    isVisible: true,
  },
  {
    key: "image",
    label: i18n.t("pages.users.image"),
    isVisible: true,
  },
  {
    key: "name",
    label: i18n.t("pages.users.name"),
    isVisible: true,
  },
  {
    key: "email",
    label: i18n.t("pages.users.email"),
    isVisible: true,
  },
  {
    key: "role",
    label: i18n.t("pages.users.role"),
    isVisible: true,
  },
  {
    key: "city",
    label: i18n.t("pages.users.city"),
    isVisible: false,
  },
  {
    key: "address",
    label: i18n.t("pages.users.address"),
    isVisible: false,
  },
  {
    key: "tel",
    label: i18n.t("pages.users.tel"),
    isVisible: false,
  },
  {
    key: "googleMap",
    label: i18n.t("pages.users.google-map-link"),
    isVisible: false,
  },
  {
    key: "createdAt",
    label: i18n.t("pages.users.created-at"),
    isVisible: true,
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.users.updated-at"),
    isVisible: false,
  },
  {
    key: "createdBy",
    label: i18n.t("pages.users.created-by"),
    isVisible: false,
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.users.updated-by"),
    isVisible: false,
  },
  {
    label: "",
    key: "actions",
    class: "w-1",
    isVisible: true,
  },
];

const usersRows = computed(() => {
  return users.value?.map((user) => {
    const actions = [
      {
        event: "update",
        label: i18n.t("pages.users.update"),
        icon: "ph:pencil-duotone",
      },
    ];

    if (!user.verified) {
      actions.push({
        event: "verify",
        label: i18n.t("pages.users.verify"),
        icon: "ph:shield-check-duotone",
      });
    } else if (!user.deletedAt) {
      actions.push({
        event: "deactivate",
        label: i18n.t("pages.users.deactivate"),
        icon: "ph:user-circle-minus-duotone",
      });
    } else {
      actions.push({
        event: "restore",
        label: i18n.t("pages.users.restore"),
        icon: "ph:user-circle-plus-duotone",
      });
    }

    actions.push({
      event: "delete",
      label: i18n.t("pages.users.delete"),
      icon: "ph:trash-duotone",
    });

    const cssClass = user.deletedAt
      ? "bg-red-500 bg-opacity-20"
      : !user.verified
        ? "bg-orange-500 bg-opacity-20"
        : "";

    return {
      id: user.id,
      sort: user.sort,
      company: user.company,
      image: user.image,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      city: user.city,
      address: user.address,
      tel: user.tel,
      googleMap: user.googleMap,
      createdAt: format(new Date(user.createdAt), "dd.MM.yyyy"),
      updatedAt: format(new Date(user.updatedAt), "dd.MM.yyyy"),
      createdBy: user.createdByUser
        ? `${user.createdByUser.firstName} ${user.createdByUser.lastName}`
        : "-",
      updatedBy: user.updatedByUser
        ? `${user.updatedByUser.firstName} ${user.updatedByUser.lastName}`
        : "-",
      deletedAt: user.deletedAt,
      class: cssClass,
      actions,
    };
  });
});

const userAddModal = ref<boolean>(false);
const userAddLoading = ref<boolean>(false);
const addUserAction = () => {
  userAddModal.value = true;
};
const onAddUser = async (state: any) => {
  userAddLoading.value = true;

  if (await addUser(state)) {
    userAddModal.value = false;
  }

  userAddLoading.value = false;
};
const addUserClose = () => {
  userAddModal.value = false;
};

const userToUpdate = ref<User | null>(null);
const userUpdateModal = ref<boolean>(false);
const userUpdateLoading = ref<boolean>(false);
const updateUserAction = (row: any) => {
  userToUpdate.value = row;
  userUpdateModal.value = true;
};
const onUpdateUser = async (state: any) => {
  userUpdateLoading.value = true;

  if (await updateUser(state)) {
    userUpdateModal.value = false;
    setTimeout(() => {
      userToUpdate.value = null;
    }, 400);
  }

  userUpdateLoading.value = false;
};
const updateUserClose = () => {
  userUpdateModal.value = false;
};

const action = async (event: { event: string; row: any }) => {
  switch (event.event) {
    case "update":
      updateUserAction(event.row);
      break;
    case "verify":
      await verifyUser(event.row.id);
      break;
    case "deactivate":
      await deactivateUser(event.row.id);
      break;
    case "restore":
      await restoreUser(event.row.id);
      break;
    case "delete":
      await deleteUser(event.row.id);
      break;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">{{ i18n.t("pages.users.users") }}</h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex justify-end">
        <UButton size="lg" type="button" @click="addUserAction">
          {{ i18n.t("pages.users.add-user") }}
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-users'"
        :columns="columns"
        :rows="usersRows"
        @on-action-click="action"
      >
        <template #role-data="{ row }">
          <span class="capitalize">
            {{ i18n.t("components.user.add." + row.role) }}
          </span>
        </template>

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

        <template #tel-data="{ row }">
          <a v-if="row.tel" :href="`tel:${row.tel}`">{{ row.tel }}</a>
        </template>

        <template #googleMap-data="{ row }">
          <a v-if="row.googleMap" :href="row.googleMap" target="_blank">
            <UIcon name="ph:map-pin-duotone" size="30" />
          </a>
        </template>
      </DataTable>
    </ClientOnly>

    <UserAdd
      :is-modal-open="userAddModal"
      :loading="userAddLoading"
      @on-close="addUserClose"
      @on-submit="onAddUser"
    />

    <UserUpdate
      v-if="userToUpdate"
      :user="userToUpdate"
      :is-modal-open="userUpdateModal"
      :loading="userUpdateLoading"
      @on-close="updateUserClose"
      @on-submit="onUpdateUser"
    />
  </div>
</template>
