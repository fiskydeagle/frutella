<script setup lang="ts">
import { type InferType, mixed, number, object, string } from "yup";
import { UserRole } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", user: typeof state): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { kosovoCities } = useUtils();

const googleMapsLinkRegex =
  /^https?:\/\/(www\.)?google\.(com|[a-z]{2})\/maps(\?q=[^&]+|\/search\/|\/place\/|\/@[^,]+,[^,]+,)/;
const schema = object({
  sort: number()
    .transform((value, originalValue) => {
      return originalValue === "" ? null : value; //
    })
    .integer("Sort number must be an integer")
    .nullable()
    .optional()
    .positive("Sort number must be a positive number"),
  company: string().required("Required"),
  firstName: string().required("Required"),
  lastName: string().required("Required"),
  email: string().email("Invalid email").required("Required"),
  password: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
  role: string().required("Required"),
  image: mixed()
    .test("image", "Only images are allowed (jpg, png, jpeg)", (value: any) => {
      if (!value || !value.length) return true;
      return ["image/jpeg", "image/png", "image/jpg"].includes(value[0].type);
    })
    .test("image", "File size must be less than 2MB", (value: any) => {
      if (!value || !value.length) return true;
      return value[0].size <= 2 * 1024 * 1024;
    }),
  city: string().required("Required"),
  address: string().required("Required"),
  googleMap: string().test(
    "is-empty-or-valid",
    "Invalid Google Maps link",
    (value) =>
      value === null ||
      value === undefined ||
      value === "" ||
      googleMapsLinkRegex.test(value), // Validate Google Maps link
  ),
});

type Schema = InferType<typeof schema>;

const formRef = ref();
const imageUploading = ref<boolean>(false);

const state = reactive({
  sort: undefined,
  company: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  role: undefined,
  password: undefined,
  image: [] as File[],
  city: "vu",
  address: undefined,
  tel: undefined,
  googleMap: undefined,
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
        sort: undefined,
        company: undefined,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        role: undefined,
        password: undefined,
        image: [] as File[],
        city: "vu",
        address: undefined,
        tel: undefined,
        googleMap: undefined,
      });
    }
  },
);
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-3xl',
    }"
  >
    <UForm
      ref="formRef"
      :schema="schema"
      :state="state"
      class="space-y-4 max-w-3xl"
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
              {{ i18n.t("components.user.add.add-user") }}
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

        <div class="flex max-sm:flex-col gap-4 w-full">
          <div class="w-full flex flex-col gap-4">
            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.sort')"
              name="sort"
            >
              <UInput type="number" :min="1" v-model="state.sort" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.company')"
              name="company"
            >
              <UInput v-model="state.company" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.first-name')"
              name="firstName"
            >
              <UInput v-model="state.firstName" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.last-name')"
              name="lastName"
            >
              <UInput v-model="state.lastName" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.email')"
              name="email"
            >
              <UInput v-model="state.email" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.role')"
              name="role"
            >
              <USelectMenu
                v-model="state.role"
                :options="[
                  {
                    id: UserRole.ADMIN,
                    label: i18n.t('components.user.add.admin'),
                  },
                  {
                    id: UserRole.EMPLOYEE,
                    label: i18n.t('components.user.add.employee'),
                  },
                  {
                    id: UserRole.CUSTOMER,
                    label: i18n.t('components.user.add.customer'),
                  },
                ]"
                value-attribute="id"
                :placeholder="i18n.t('components.user.add.role')"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.password')"
              name="password"
            >
              <UInput v-model="state.password" type="password" />
            </UFormGroup>
          </div>
          <div class="w-full flex flex-col gap-4">
            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.image')"
              name="image"
            >
              <template #default="{ error }">
                <InputsUploadFile
                  v-model="state.image"
                  :label="i18n.t('components.user.add.drop-or-click-upload')"
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
              :label="i18n.t('components.user.add.city')"
              name="city"
            >
              <USelectMenu
                v-model="state.city"
                searchable
                :searchable-placeholder="
                  i18n.t('components.user.add.search-city')
                "
                :placeholder="i18n.t('components.user.add.city')"
                :options="kosovoCities"
                value-attribute="code"
                option-attribute="name"
                :search-attributes="['name', 'colors']"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.address')"
              name="address"
            >
              <UTextarea v-model="state.address" autoresize />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.tel')"
              name="tel"
            >
              <UInput v-model="state.tel" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.google-map-link')"
              name="googleMap"
            >
              <template v-if="state.googleMap" #hint>
                <a :href="state.googleMap" target="_blank">
                  <UIcon name="ph:map-pin-duotone" size="24" />
                </a>
              </template>
              <UTextarea v-model="state.googleMap" autoresize />
            </UFormGroup>
          </div>
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
              {{ i18n.t("components.user.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.user.add.add") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
