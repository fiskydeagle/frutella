<script setup lang="ts">
import { object, string, type InferType, number } from "yup";
import type { FormSubmitEvent } from "#ui/types";
import { useAuthUser } from "~/composables/useAuthUser";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.register"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.register"),
      },
    ],
  };
});

const { userTypes, getUserTypes } = useUserType();
getUserTypes(true);
const { register } = useAuthUser();

const schema = object({
  userTypeId: number().required("Required"),
  company: string().required("Required"),
  firstName: string().required("Required"),
  lastName: string().required("Required"),
  email: string().email("Invalid email").required("Required"),
  tel: string().required("Required"),
  password: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  userTypeId: undefined,
  company: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  tel: undefined,
  password: undefined,
});

const registerLoading = ref<boolean>(false);
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  registerLoading.value = true;
  await register(state);
  registerLoading.value = false;
};
</script>

<template>
  <div class="max-w-screen-sm m-auto">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UCard>
        <template #header>
          <h1 class="text-xl">{{ i18n.t("pages.register.register") }}</h1>
        </template>

        <div class="flex flex-col gap-4">
          <UFormGroup
            v-if="userTypes && userTypes.length"
            size="lg"
            :label="i18n.t('pages.register.user-type')"
            name="userTypeId"
          >
            <URadioGroup
              v-model="state.userTypeId"
              value-attribute="id"
              option-attribute="name"
              :options="userTypes"
            />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('pages.register.company')"
            name="company"
          >
            <UInput v-model="state.company" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('pages.register.first-name')"
            name="firstName"
          >
            <UInput v-model="state.firstName" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('pages.register.last-name')"
            name="lastName"
          >
            <UInput v-model="state.lastName" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('pages.register.email')"
            name="email"
          >
            <UInput v-model="state.email" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('pages.register.tel')"
            name="tel"
          >
            <UInput v-model="state.tel" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('pages.register.password')"
            name="password"
          >
            <UInput v-model="state.password" type="password" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 justify-end text-center">
            <UButton
              :loading="registerLoading"
              class="justify-center"
              size="xl"
              type="submit"
            >
              {{ i18n.t("pages.register.register") }}
            </UButton>

            <div class="flex gap-x-6 gap-y-2 flex-wrap justify-center">
              <div>
                <p>{{ i18n.t("pages.forgot-password.have-account") }}</p>
                <ULink
                  :to="{ name: 'login' }"
                  active-class="text-primary"
                  inactive-class="text-primary hover:text-primary-600"
                  >{{ i18n.t("pages.forgot-password.login") }}
                </ULink>
              </div>
            </div>
          </div>
        </template>
      </UCard>
    </UForm>
  </div>
</template>
