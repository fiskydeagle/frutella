<script setup lang="ts">
import { format } from "date-fns";
import { useSystemUsers } from "~/composables/useSystemUsers";
import { type User } from "~/types";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - Users",
    meta: [
      {
        name: "description",
        content: "Users Page.",
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "admin"],
});

const {
  users,
  getUsers,
  addUser,
  updateUser,
  deactivateUser,
  restoreUser,
  deleteUser,
} = useSystemUsers();
await getUsers();

const columns = [
  {
    key: "id",
    label: i18n.t("pages.users.id"),
  },
  {
    key: "name",
    label: i18n.t("pages.users.name"),
  },
  {
    key: "email",
    label: i18n.t("pages.users.email"),
  },
  {
    key: "role",
    label: i18n.t("pages.users.role"),
  },
  {
    key: "createdAt",
    label: i18n.t("pages.users.created-at"),
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.users.updated-at"),
  },
  {
    key: "createdBy",
    label: i18n.t("pages.users.created-by"),
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.users.updated-by"),
  },
  {
    label: "",
    key: "actions",
    class: "w-1",
  },
];

const selectedColumns = ref([...columns]);

const usersRows = computed(() => {
  return users.value?.map((user) => {
    const actions = [
      {
        event: "update",
        label: i18n.t("pages.users.update"),
        icon: "ph:pencil-duotone",
      },
    ];

    if (!user.deletedAt) {
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

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      createdAt: format(new Date(user.createdAt), "dd MMMM, yyyy"),
      updatedAt: format(new Date(user.updatedAt), "dd MMMM, yyyy"),
      createdBy: user.createdByUser
        ? `${user.createdByUser.firstName} ${user.createdByUser.lastName}`
        : "-",
      updatedBy: user.updatedByUser
        ? `${user.updatedByUser.firstName} ${user.updatedByUser.lastName}`
        : "-",
      deletedAt: user.deletedAt,
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
    }, 1000);
  }

  userUpdateLoading.value = false;
  setTimeout(() => {
    userToUpdate.value = null;
  }, 1000);
};
const updateUserClose = () => {
  userUpdateModal.value = false;
};

const action = async (event: string, row: any) => {
  switch (event) {
    case "update":
      updateUserAction(row);
      break;
    case "deactivate":
      await deactivateUser(row.id);
      break;
    case "restore":
      await restoreUser(row.id);
      break;
    case "delete":
      await deleteUser(row.id);
      break;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">Users</h1>
    <div class="px-3 py-3 border-b border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex justify-end order-1 sm:order-3">
          <UButton size="lg" type="button" @click="addUserAction">
            {{ i18n.t("pages.users.add-user") }}
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
    <UTable :columns="selectedColumns" :rows="usersRows" class="frutella-table">
      <template #role-data="{ row }">
        <span class="capitalize">{{ row.role }}</span>
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
<style lang="postcss">
.frutella-table tr {
  @apply relative;
}
</style>
