<script setup lang="ts">
import { type InferType, object, string, mixed } from "yup";
import { type Product, UnitType } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
  product: Product;
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
    .test(
      "image",
      "Required",
      (value: any) => (value && value.length) || !editImage.value,
    )
    .test("image", "Only images are allowed (jpg, png, jpeg)", (value: any) => {
      if (!value || !value.length) return true;
      return ["image/jpeg", "image/png", "image/jpg"].includes(value[0].type);
    })
    .test("image", "File size must be less than 2MB", (value: any) => {
      if (!value || !value.length) return true;
      return value[0].size <= 2 * 1024 * 1024;
    }),
  unitType: string().required("Required"),
});

type Schema = InferType<typeof schema>;

const formRef = ref();
const imageUploading = ref<boolean>(false);
const editImage = ref<boolean>(!props.product.image);
const state = reactive({
  id: props.product.id,
  name: props.product.name,
  image: [] as File[],
  imageLink: props.product.image,
  unitType: props.product.unitType,
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
    if (isOpen) {
      editImage.value = !props.product.image;
      Object.assign(state, {
        id: props.product.id,
        name: props.product.name,
        image: [] as File[],
        imageLink: props.product.image,
        unitType: props.product.unitType,
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
              {{ i18n.t("components.product.update.update-product") }}
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
            :label="i18n.t('components.product.update.name')"
            name="name"
          >
            <UInput v-model="state.name" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.product.update.image')"
            name="image"
          >
            <template #default="{ error }">
              <div
                v-if="product.image && !editImage"
                class="overflow-hidden border border-gray-300 rounded relative h-48"
              >
                <img
                  :src="product.image"
                  alt="product image"
                  class="w-full h-full object-contain"
                />

                <button
                  class="absolute flex items-center justify-center w-10 h-10 bg-white bg-opacity-80 top-2 right-2 cursor-pointer rounded-full border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600"
                  @click="editImage = true"
                >
                  <Icon name="ph:pencil-duotone" size="30" />
                </button>
              </div>
              <InputsUploadFile
                v-else
                v-model="state.image"
                :label="
                  i18n.t('components.product.update.drop-or-click-upload')
                "
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
            :label="i18n.t('components.product.update.unit-type')"
            name="unitType"
          >
            <USelectMenu
              v-model="state.unitType"
              :options="[
                {
                  id: UnitType.Piece,
                  label: i18n.t('components.product.update.piece'),
                },
                {
                  id: UnitType.Kg,
                  label: i18n.t('components.product.update.kg'),
                },
                {
                  id: UnitType.Liter,
                  label: i18n.t('components.product.update.liter'),
                },
                {
                  id: UnitType.Crates,
                  label: i18n.t('components.product.update.crates'),
                },
                {
                  id: UnitType.Box,
                  label: i18n.t('components.product.update.box'),
                },
              ]"
              value-attribute="id"
              :placeholder="i18n.t('components.product.update.unit-type')"
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
              {{ i18n.t("components.product.update.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.product.update.update") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
