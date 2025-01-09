<script setup lang="ts">
import { type InferType, object, string, mixed } from "yup";
import { type Supplier, UnitType } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
  supplier: Supplier;
  isModalOpen: boolean;
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", product: typeof state): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { kosovoCities } = useUtils();

const schema = object({
  company: string().required("Required"),
  image: mixed()
    .test("image", "Only images are allowed (jpg, png, jpeg)", (value: any) => {
      if (!value || !value.length) return true;
      return ["image/jpeg", "image/png", "image/jpg"].includes(value[0].type);
    })
    .test("image", "File size must be less than 2MB", (value: any) => {
      if (!value || !value.length) return true;
      return value[0].size <= 2 * 1024 * 1024;
    }),
});

type Schema = InferType<typeof schema>;

const formRef = ref();
const imageUploading = ref<boolean>(false);
const editImage = ref<boolean>(!props.supplier.image);
const state = reactive({
  id: props.supplier.id,
  company: props.supplier.company,
  image: [] as File[],
  imageLink: props.supplier.image,
  deleteImage: false,
  firstName: props.supplier.firstName,
  lastName: props.supplier.lastName,
  city: props.supplier.city,
  address: props.supplier.address,
  tel: props.supplier.tel,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (
    (!state.image || !state.image.length) &&
    state.imageLink &&
    editImage.value
  ) {
    state.deleteImage = true;
  }
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
      editImage.value = !props.supplier.image;
      Object.assign(state, {
        id: props.supplier.id,
        company: props.supplier.company,
        image: [] as File[],
        imageLink: props.supplier.image,
        deleteImage: false,
        firstName: props.supplier.firstName,
        lastName: props.supplier.lastName,
        city: props.supplier.city,
        address: props.supplier.address,
        tel: props.supplier.tel,
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
              {{ i18n.t("components.supplier.update.update-supplier") }}
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
            :label="i18n.t('components.supplier.update.company')"
            name="company"
          >
            <UInput v-model="state.company" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.update.image')"
            name="image"
          >
            <template #default="{ error }">
              <div
                v-if="supplier.image && !editImage"
                class="overflow-hidden border border-gray-300 rounded relative h-48"
              >
                <img
                  :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${supplier.image}`"
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
                  i18n.t('components.supplier.update.drop-or-click-upload')
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
            :label="i18n.t('components.supplier.update.firstName')"
            name="firstName"
          >
            <UInput v-model="state.firstName" />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.update.lastName')"
            name="lastName"
          >
            <UInput v-model="state.lastName" />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.update.city')"
            name="city"
          >
            <USelectMenu
              v-model="state.city"
              searchable
              :searchable-placeholder="
                i18n.t('components.supplier.update.search-city')
              "
              :placeholder="i18n.t('components.supplier.update.city')"
              :options="kosovoCities"
              value-attribute="code"
              option-attribute="name"
              :search-attributes="['name']"
            />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.update.address')"
            name="address"
          >
            <UTextarea v-model="state.address" autoresize />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.update.tel')"
            name="tel"
          >
            <UInput v-model="state.tel" />
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
              {{ i18n.t("components.supplier.update.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.supplier.update.update") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
