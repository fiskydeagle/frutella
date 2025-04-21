<script setup lang="ts">
import { type InferType, mixed, number, object, string } from "yup";
import { type User, UserRole } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
  user: User;
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
const { userTypes, getUserTypes } = useUserType();

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
  role: string().required("Required"),
  userTypeId: number().when("role", {
    is: (role: UserRole) => role === UserRole.CUSTOMER,
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
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
const editImage = ref<boolean>(!props.user.image);

const state = reactive({
  id: props.user.id,
  sort: props.user.sort,
  company: props.user.company,
  firstName: props.user.firstName,
  lastName: props.user.lastName,
  role: props.user.role,
  userTypeId: props.user.userTypeId,
  image: [] as File[],
  imageLink: props.user.image,
  deleteImage: false,
  city: props.user.city || "vu",
  address: props.user.address,
  tel: props.user.tel,
  googleMap: props.user.googleMap || "",
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
      getUserTypes();
      editImage.value = !props.user.image;
      Object.assign(state, {
        id: props.user.id,
        sort: props.user.sort,
        company: props.user.company,
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        role: props.user.role,
        userTypeId: props.user.userTypeId,
        image: [] as File[],
        imageLink: props.user.image,
        deleteImage: false,
        city: props.user.city || "vu",
        address: props.user.address,
        tel: props.user.tel,
        googleMap: props.user.googleMap || "",
      });
    }
  },
  {
    immediate: true,
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
              {{ i18n.t("components.user.update.update-user") }}
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
              :label="i18n.t('components.user.update.sort')"
              name="sort"
            >
              <UInput type="number" :min="1" v-model="state.sort" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.role')"
              name="role"
            >
              <USelectMenu
                v-model="state.role"
                :options="[
                  {
                    id: UserRole.ADMIN,
                    label: i18n.t('components.user.update.admin'),
                  },
                  {
                    id: UserRole.EMPLOYEE,
                    label: i18n.t('components.user.update.employee'),
                  },
                  {
                    id: UserRole.CUSTOMER,
                    label: i18n.t('components.user.update.customer'),
                  },
                ]"
                value-attribute="id"
                placeholder="Role"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.type')"
              name="userTypeId"
            >
              <USelectMenu
                v-model="state.userTypeId"
                :options="userTypes"
                value-attribute="id"
                option-attribute="name"
                :placeholder="i18n.t('components.user.update.type')"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.company')"
              name="company"
            >
              <UInput v-model="state.company" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.first-name')"
              name="firstName"
            >
              <UInput v-model="state.firstName" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.last-name')"
              name="lastName"
            >
              <UInput v-model="state.lastName" />
            </UFormGroup>
          </div>
          <div class="w-full flex flex-col gap-4">
            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.image')"
              name="image"
            >
              <template #default="{ error }">
                <div
                  v-if="user.image && !editImage"
                  class="overflow-hidden border border-gray-300 rounded relative h-48"
                >
                  <img
                    :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${user.image}`"
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
                  :label="i18n.t('components.user.update.drop-or-click-upload')"
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
              :label="i18n.t('components.user.update.city')"
              name="city"
            >
              <USelectMenu
                v-model="state.city"
                searchable
                :searchable-placeholder="
                  i18n.t('components.user.update.search-city')
                "
                :placeholder="i18n.t('components.user.update.city')"
                :options="kosovoCities"
                value-attribute="code"
                option-attribute="name"
                :search-attributes="['name']"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.address')"
              name="address"
            >
              <UTextarea v-model="state.address" autoresize />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.tel')"
              name="tel"
            >
              <UInput v-model="state.tel" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.google-map-link')"
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
              {{ i18n.t("components.user.update.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.user.update.update") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
