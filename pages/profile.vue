<script setup lang="ts">
import { type InferType, mixed, object, string } from "yup";
import { useAuthUser } from "~/composables/useAuthUser";
import type { FormSubmitEvent } from "#ui/types";
import { useSystemUsers } from "~/composables/useSystemUsers";

const i18n = useI18n();
const { user } = useAuthUser();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.profile"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.profile"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth"],
});

const { updateProfile, changePassword } = useSystemUsers();
const { kosovoCities } = useUtils();

const googleMapsLinkRegex =
  /^https?:\/\/(www\.)?google\.(com|[a-z]{2})\/maps(\?q=[^&]+|\/search\/|\/place\/|\/@[^,]+,[^,]+,)/;
const profileSchema = object({
  company: string().required("Required"),
  firstName: string().required("Required"),
  lastName: string().required("Required"),
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
  tel: string().required("Required"),
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

type ProfileSchema = InferType<typeof profileSchema>;

const formRef = ref();
const imageUploading = ref<boolean>(false);
const editImage = ref<boolean>(!user.value?.image);

const profileState = reactive({
  company: user.value?.company,
  firstName: user.value?.firstName,
  lastName: user.value?.lastName,
  image: [] as File[],
  imageLink: user.value?.image,
  deleteImage: false,
  city: user.value?.city || "vu",
  address: user.value?.address,
  tel: user.value?.tel,
  googleMap: user.value?.googleMap,
});

const profileLoading = ref<boolean>(false);
const onProfileUpdate = async (event: FormSubmitEvent<ProfileSchema>) => {
  profileLoading.value = true;
  if (
    (!profileState.image || !profileState.image.length) &&
    profileState.imageLink &&
    editImage.value
  ) {
    profileState.deleteImage = true;
  }
  if (await updateProfile(profileState)) {
    editImage.value = !user.value?.image;
    Object.assign(profileState, {
      company: user.value?.company,
      firstName: user.value?.firstName,
      lastName: user.value?.lastName,
      image: [] as File[],
      imageLink: user.value?.image,
      deleteImage: false,
      city: user.value?.city || "vu",
      address: user.value?.address,
      tel: user.value?.tel,
      googleMap: user.value?.googleMap,
    });
  }
  profileLoading.value = false;
};

const passwordSchema = object({
  oldPassword: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
  password: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
});

type PasswordSchema = InferType<typeof passwordSchema>;

const passwordState = reactive({
  oldPassword: undefined,
  password: undefined,
});

const passwordLoading = ref<boolean>(false);
const onPasswordUpdate = async (event: FormSubmitEvent<PasswordSchema>) => {
  passwordLoading.value = true;
  if (await changePassword(passwordState)) {
    Object.assign(passwordState, {
      oldPassword: undefined,
      password: undefined,
    });
  }
  passwordLoading.value = false;
};
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.profile.profile") }}
    </h1>

    <div class="flex max-md:flex-col gap-x-6 gap-y-4">
      <UForm
        :schema="profileSchema"
        :state="profileState"
        class="space-y-4 w-full"
        @submit="onProfileUpdate"
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
                {{ i18n.t("pages.profile.update-profile") }}
              </h6>
            </div>
          </template>

          <div class="flex flex-col gap-4">
            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.company')"
              name="company"
            >
              <UInput v-model="profileState.company" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.first-name')"
              name="firstName"
            >
              <UInput v-model="profileState.firstName" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.last-name')"
              name="lastName"
            >
              <UInput v-model="profileState.lastName" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.image')"
              name="image"
            >
              <template #default="{ error }">
                <div
                  v-if="user?.image && !editImage"
                  class="overflow-hidden border border-gray-300 rounded relative h-48"
                >
                  <img
                    :src="`${useRuntimeConfig().public.PUBLIC_FILES_URL}${user?.image}`"
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
                  v-model="profileState.image"
                  :label="i18n.t('pages.profile.drop-or-click-upload')"
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
              :label="i18n.t('pages.profile.city')"
              name="city"
            >
              <USelectMenu
                v-model="profileState.city"
                searchable
                :searchable-placeholder="i18n.t('pages.profile.search-city')"
                :placeholder="i18n.t('pages.profile.city')"
                :options="kosovoCities"
                value-attribute="code"
                option-attribute="name"
                :search-attributes="['name', 'colors']"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.address')"
              name="address"
            >
              <UTextarea v-model="profileState.address" autoresize />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.tel')"
              name="tel"
            >
              <UInput v-model="profileState.tel" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.google-map-link')"
              name="googleMap"
            >
              <template v-if="profileState.googleMap" #hint>
                <a :href="profileState.googleMap" target="_blank">
                  <UIcon name="ph:map-pin-duotone" size="24" />
                </a>
              </template>
              <UTextarea v-model="profileState.googleMap" autoresize />
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex items-center justify-end gap-2">
              <UButton
                class="justify-center"
                size="lg"
                type="submit"
                :loading="profileLoading"
              >
                {{ i18n.t("pages.profile.update") }}
              </UButton>
            </div>
          </template>
        </UCard>
      </UForm>

      <UForm
        :schema="passwordSchema"
        :state="passwordState"
        class="space-y-4 w-full"
        @submit="onPasswordUpdate"
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
                {{ i18n.t("pages.profile.update-password") }}
              </h6>
            </div>
          </template>

          <div class="flex flex-col gap-4">
            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.old-password')"
              name="oldPassword"
            >
              <UInput v-model="passwordState.oldPassword" type="password" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('pages.profile.password')"
              name="password"
            >
              <UInput v-model="passwordState.password" type="password" />
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex items-center justify-end gap-2">
              <UButton
                class="justify-center"
                size="lg"
                type="submit"
                :loading="passwordLoading"
              >
                {{ i18n.t("pages.profile.update") }}
              </UButton>
            </div>
          </template>
        </UCard>
      </UForm>
    </div>
  </div>
</template>
