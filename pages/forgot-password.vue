<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";
import { useAuthUser } from "~/composables/useAuthUser";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Frutella - Forgot password",
    meta: [
      {
        name: "description",
        content: "Forgot password Page.",
      },
    ],
  };
});

const { recoverPassword } = useAuthUser();

const schema = object({
  email: string().email("Invalid email").required("Required"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  email: undefined,
});

const recoverLoading = ref<boolean>(false);
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  recoverLoading.value = true;
  await recoverPassword(state);
  recoverLoading.value = false;
};
</script>

<template>
  <div class="max-w-screen-sm m-auto">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UCard>
        <template #header>
          <h1 class="text-xl">
            {{ i18n.t("pages.forgot-password.password-recovery") }}
          </h1>
        </template>

        <div class="flex flex-col gap-4">
          <UFormGroup
            size="lg"
            :label="i18n.t('pages.forgot-password.email')"
            name="email"
          >
            <UInput v-model="state.email" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 justify-end text-center">
            <UButton
              :loading="recoverLoading"
              class="justify-center"
              size="xl"
              type="submit"
            >
              {{ i18n.t("pages.forgot-password.send") }}
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
              <div>
                <p>{{ i18n.t("pages.login.no-account") }}</p>
                <ULink
                  :to="{ name: 'register' }"
                  active-class="text-primary"
                  inactive-class="text-primary hover:text-primary-600"
                  >{{ i18n.t("pages.login.create-account") }}
                </ULink>
              </div>
            </div>
          </div>
        </template>
      </UCard>
    </UForm>
  </div>
</template>
