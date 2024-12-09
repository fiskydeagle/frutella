<script setup lang="ts">
import { format } from "date-fns";
import type { Incoming } from "~/types";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  loading: boolean;
  incoming: Incoming;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", incoming: { id: number }): void;
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
    class="max-w-md"
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
            {{ i18n.t("components.incoming.delete.delete-incoming") }}
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

      <p>{{ i18n.t("components.incoming.delete.description") }}</p>
      <p>
        {{ i18n.t("components.incoming.update.description") }}:
        {{ incoming.description }} <br />
        {{ i18n.t("components.incoming.update.created-at") }}:
        {{ format(new Date(incoming.createdAt), "dd.MM.yyyy HH:mm") }}
      </p>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <UButton
            type="button"
            size="lg"
            color="gray"
            variant="ghost"
            @click="isOpen = false"
          >
            {{ i18n.t("components.incoming.delete.cancel") }}
          </UButton>

          <UButton
            class="justify-center"
            size="lg"
            color="red"
            :loading="loading"
            @click="emits('onSubmit', { id: incoming.id })"
          >
            {{ i18n.t("components.incoming.delete.delete") }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
