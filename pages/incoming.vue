<script setup lang="ts">
import { useIncoming } from "~/composables/useIncoming";
import type { Incoming } from "~/types";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.incoming"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.incoming"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "verified", "admin"],
});

const {
  items,
  total,
  count,
  page,
  getIncomings,
  addIncoming,
  updateIncoming,
  deleteIncoming,
} = useIncoming();
await getIncomings();

const incomingCreatedAt = ref<string | undefined>(undefined);
const incomingAddModal = ref<boolean>(false);
const incomingAddLoading = ref<boolean>(false);

const onAddIncoming = async (state: any) => {
  incomingAddLoading.value = true;

  if (await addIncoming({ ...state, createdAt: incomingCreatedAt.value })) {
    incomingAddModal.value = false;
    incomingCreatedAt.value = undefined;
  }

  incomingAddLoading.value = false;
};

const onAdd = (createdAt: string) => {
  incomingCreatedAt.value = createdAt;
  incomingAddModal.value = true;
};

const incomingToUpdate = ref<Incoming | null>(null);
const incomingUpdateModal = ref<boolean>(false);
const incomingUpdateLoading = ref<boolean>(false);

const onUpdateIncoming = async (state: any) => {
  incomingUpdateLoading.value = true;

  if (await updateIncoming(state)) {
    incomingUpdateModal.value = false;
  }

  incomingUpdateLoading.value = false;
};

const closeUpdateIncoming = async (state: any) => {
  incomingUpdateModal.value = false;

  setTimeout(() => {
    incomingToUpdate.value = null;
  }, 400);
};

const onUpdate = (incoming: Incoming) => {
  incomingToUpdate.value = incoming;
  incomingUpdateModal.value = true;
};

const incomingToDelete = ref<Incoming | null>(null);
const incomingDeleteModal = ref<boolean>(false);
const incomingDeleteLoading = ref<boolean>(false);

const onDeleteIncoming = async (state: any) => {
  incomingDeleteLoading.value = true;

  if (await deleteIncoming(state)) {
    incomingDeleteModal.value = false;
  }

  incomingDeleteLoading.value = false;
};

const closeDeleteIncoming = async (state: any) => {
  incomingDeleteModal.value = false;

  setTimeout(() => {
    incomingToDelete.value = null;
  }, 400);
};

const onDelete = (incoming: Incoming) => {
  incomingToDelete.value = incoming;
  incomingDeleteModal.value = true;
};

const loadMoreLoading = ref<boolean>(false);
const loadMore = async () => {
  loadMoreLoading.value = true;
  page.value++;
  await getIncomings();
  loadMoreLoading.value = false;
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.incoming.title") }}
    </h1>
    <div class="px-3 pb-3 flex justify-between items-start gap-4">
      <h2 class="text-3xl font-medium">
        {{ i18n.t("pages.incoming.total") }}:
        <span class="inline-block">{{ total.toFixed(2) }} €</span>
      </h2>
      <UButton
        class="justify-center"
        size="lg"
        type="button"
        @click="incomingAddModal = true"
      >
        {{ i18n.t("pages.incoming.add-new-entry") }}
      </UButton>
    </div>

    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      v-if="items && items.length"
    >
      <IncomingItem
        v-for="incoming in items"
        :key="'incoming-' + new Date(incoming.createdAt).getTime()"
        :incoming="incoming"
        @on-add="onAdd"
        @on-update="onUpdate"
        @on-delete="onDelete"
      />
    </div>

    <div v-if="items && items?.length < count" class="flex justify-center mt-6">
      <UButton
        :loading="loadMoreLoading"
        class="justify-center"
        size="lg"
        type="button"
        @click="loadMore"
      >
        {{ i18n.t("common.load-more") }}
      </UButton>
    </div>

    <IncomingAdd
      :is-modal-open="incomingAddModal"
      :loading="incomingAddLoading"
      :created-at="incomingCreatedAt"
      @on-close="
        incomingAddModal = false;
        incomingCreatedAt = undefined;
      "
      @on-submit="onAddIncoming"
    />

    <IncomingUpdate
      v-if="incomingToUpdate"
      :is-modal-open="incomingUpdateModal"
      :loading="incomingUpdateLoading"
      :incoming="incomingToUpdate"
      @on-close="closeUpdateIncoming"
      @on-submit="onUpdateIncoming"
    />

    <IncomingDelete
      v-if="incomingToDelete"
      :is-modal-open="incomingDeleteModal"
      :loading="incomingDeleteLoading"
      :incoming="incomingToDelete"
      @on-close="closeDeleteIncoming"
      @on-submit="onDeleteIncoming"
    />
  </div>
</template>
