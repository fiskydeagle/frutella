<script setup lang="ts">
import { type InferType, object, string, mixed } from "yup";
import { UnitType } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", product: typeof state): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const schema = object({
  name: string().required("Required"),
  image: mixed()
    .test("image", "Required", (value: any) => value && value.length)
    .test("image", "Only images are allowed (jpg, png, jpeg)", (value: any) => {
      if (!value || !value.length) return false;
      return ["image/jpeg", "image/png", "image/jpg"].includes(value[0].type);
    })
    .test("image", "File size must be less than 2MB", (value: any) => {
      if (!value || !value.length) return false;
      return value[0].size <= 2 * 1024 * 1024;
    }),
  unitType: string().required("Required"),
});

type Schema = InferType<typeof schema>;

const formRef = ref();
const imageUploading = ref<boolean>(false);
const state = reactive({
  name: undefined,
  image: [] as File[],
  unitType: undefined,
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
        name: undefined,
        image: [] as File[],
        unitType: undefined,
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
    class="max-w-md"
  >
    <UForm
      ref="formRef"
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
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
              {{ i18n.t("components.product.add.add-product") }}
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
            :label="i18n.t('components.product.add.name')"
            name="name"
          >
            <UInput v-model="state.name" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.product.add.image')"
            name="image"
          >
            <template #default="{ error }">
              <InputsUploadFile
                v-model="state.image"
                :label="i18n.t('components.product.add.drop-or-click-upload')"
                :accept="['image/jpeg', 'image/jpg', 'image/png']"
                :full-width="true"
                :loading="imageUploading"
                :class="error ? 'border border-red-500 rounded' : ''"
                @change="formRef?.validate('image', { silent: true })"
              />
            </template>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.product.add.unit-type')"
            name="unitType"
          >
            <USelectMenu
              v-model="state.unitType"
              :options="[
                {
                  id: UnitType.Piece,
                  label: i18n.t('components.product.add.piece'),
                },
                {
                  id: UnitType.Kg,
                  label: i18n.t('components.product.add.kg'),
                },
                {
                  id: UnitType.Liter,
                  label: i18n.t('components.product.add.liter'),
                },
                {
                  id: UnitType.Crates,
                  label: i18n.t('components.product.add.crates'),
                },
                {
                  id: UnitType.Box,
                  label: i18n.t('components.product.add.box'),
                },
              ]"
              value-attribute="id"
              :placeholder="i18n.t('components.product.add.unit-type')"
            />
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
              {{ i18n.t("components.product.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.product.add.add") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
