<script setup lang="ts">
import { type InferType, object, string } from "yup";
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
  middleware: "auth",
});

const { updateProfile, changePassword } = useSystemUsers();

const profileSchema = object({
  firstName: string().required("Required"),
  lastName: string().required("Required"),
});

type ProfileSchema = InferType<typeof profileSchema>;

const profileState = reactive({
  firstName: user.value?.firstName,
  lastName: user.value?.lastName,
});

const profileLoading = ref<boolean>(false);
const onProfileUpdate = async (event: FormSubmitEvent<ProfileSchema>) => {
  profileLoading.value = true;
  await updateProfile(profileState);
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
            <UFormGroup size="lg" label="First Name" name="firstName">
              <UInput v-model="profileState.firstName" />
            </UFormGroup>

            <UFormGroup size="lg" label="Last Name" name="lastName">
              <UInput v-model="profileState.lastName" />
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
            <UFormGroup size="lg" label="Old password" name="oldPassword">
              <UInput v-model="passwordState.oldPassword" type="password" />
            </UFormGroup>

            <UFormGroup size="lg" label="Password" name="password">
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
