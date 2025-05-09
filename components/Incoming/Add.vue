<script setup lang="ts">
import { format } from "date-fns";
import { type InferType, object, string, number } from "yup";
import { IncomingType } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  loading: boolean;
  createdAt?: string;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", incoming: typeof state): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const schema = object({
  type: string().required("Required"),
  description: string().required("Required"),
  value: number()
    .moreThan(0, "The number must be greater than 0")
    .required("Required"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  type: IncomingType.Addition,
  description: undefined,
  value: undefined,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  emits("onSubmit", state);
};

const isOpen = computed({
  get: () => props.isModalOpen,
  set: (value) => {
    if (!value) emits("onClose");
  },
});

watch(
  () => isOpen.value,
  (isOpen) => {
    if (!isOpen) {
      Object.assign(state, {
        type: IncomingType.Addition,
        description: undefined,
        value: undefined,
      });
    }
  },
);
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-md',
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
              {{ i18n.t("components.incoming.add.add-incoming") }}
              <template v-if="createdAt">
                {{ i18n.t("components.incoming.add.for-date") }}
                {{ format(new Date(createdAt), "dd.MM.yyyy") }}
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

        <div class="flex flex-col gap-4">
          <UFormGroup
            size="lg"
            :label="i18n.t('components.incoming.add.type')"
            name="type"
          >
            <URadioGroup
              v-model="state.type"
              class="radio-group-flex"
              :options="[
                {
                  id: IncomingType.Addition,
                  label: i18n.t('components.incoming.add.addition'),
                },
                {
                  id: IncomingType.Discount,
                  label: i18n.t('components.incoming.add.discount'),
                },
              ]"
              value-attribute="id"
              :placeholder="i18n.t('components.incoming.add.type')"
            />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.incoming.add.description')"
            name="description"
          >
            <UInput v-model="state.description" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.incoming.add.value')"
            name="value"
          >
            <UInput v-model="state.value" type="number" />
          </UFormGroup>
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
              {{ i18n.t("components.incoming.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.incoming.add.add") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
