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
const state = reactive({
  company: undefined,
  image: [] as File[],
  firstName: undefined,
  lastName: undefined,
  city: undefined,
  address: undefined,
  tel: undefined,
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
        company: undefined,
        image: [] as File[],
        firstName: undefined,
        lastName: undefined,
        city: undefined,
        address: undefined,
        tel: undefined,
      });
    }
  }
);
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-md',
    }"
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
              {{ i18n.t("components.supplier.add.add-supplier") }}
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
            :label="i18n.t('components.supplier.add.company')"
            name="company"
          >
            <UInput v-model="state.company" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.add.image')"
            name="image"
          >
            <template #default="{ error }">
              <InputsUploadFile
                v-model="state.image"
                :label="i18n.t('components.supplier.add.drop-or-click-upload')"
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
            :label="i18n.t('components.supplier.add.firstName')"
            name="firstName"
          >
            <UInput v-model="state.firstName" />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.add.lastName')"
            name="lastName"
          >
            <UInput v-model="state.lastName" />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.add.city')"
            name="city"
          >
            <UInput v-model="state.city" />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.add.address')"
            name="address"
          >
            <UInput v-model="state.address" />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.add.tel')"
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
              {{ i18n.t("components.supplier.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.supplier.add.add") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
