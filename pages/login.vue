<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";
import { useAuthUser } from "~/composables/useAuthUser";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - " + i18n.t("page-titles.login"),
    meta: [
      {
        name: "description",
        content: "Login Page.",
      },
    ],
  };
});

const { login } = useAuthUser();

const schema = object({
  email: string().email("Invalid email").required("Required"),
  password: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  email: undefined,
  password: undefined,
});

const loginLoading = ref<boolean>(false);
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loginLoading.value = true;
  await login(state);
  loginLoading.value = false;
};
</script>

<template>
  <div class="max-w-screen-sm m-auto">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UCard>
        <template #header>
          <h1 class="text-xl">{{ i18n.t("pages.login.login") }}</h1>
        </template>

        <div class="flex flex-col gap-4">
          <UFormGroup
            size="lg"
            :label="i18n.t('pages.login.email')"
            name="email"
          >
            <UInput v-model="state.email" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('pages.login.password')"
            name="password"
          >
            <UInput v-model="state.password" type="password" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 justify-end text-center">
            <UButton
              :loading="loginLoading"
              class="justify-center"
              size="xl"
              type="submit"
            >
              {{ i18n.t("pages.login.login") }}
            </UButton>

            <div class="flex gap-x-6 gap-y-2 flex-wrap justify-center">
              <div>
                <p>{{ i18n.t("pages.login.no-account") }}</p>
                <ULink
                  :to="{ name: 'register' }"
                  active-class="text-primary"
                  inactive-class="text-primary hover:text-primary-600"
                  >{{ i18n.t("pages.login.create-account") }}
                </ULink>
              </div>
              <div>
                <p>{{ i18n.t("pages.login.forgot-password") }}</p>
                <ULink
                  :to="{ name: 'forgot-password' }"
                  active-class="text-primary"
                  inactive-class="text-primary hover:text-primary-600"
                  >{{ i18n.t("pages.login.click-here") }}
                </ULink>
              </div>
            </div>
          </div>
        </template>
      </UCard>
    </UForm>
  </div>
</template>
