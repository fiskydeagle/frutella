<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";
import { useAuthUser } from "~/composables/useAuthUser";

useHead(() => {
  return {
    title: "Frutella - Login",
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

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await login(state);
};
</script>

<template>
  <div class="max-w-screen-sm m-auto">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UCard>
        <template #header>
          <h1 class="text-xl">Login</h1>
        </template>

        <div class="flex flex-col gap-4">
          <UFormGroup size="lg" label="Email" name="email">
            <UInput v-model="state.email" />
          </UFormGroup>

          <UFormGroup size="lg" label="Password" name="password">
            <UInput v-model="state.password" type="password" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 justify-end text-center">
            <UButton class="justify-center" size="xl" type="submit">
              Login
            </UButton>
            <p>Don't have an account yet?</p>
            <ULink
              to="/register"
              active-class="text-primary"
              inactive-class="text-primary hover:text-primary-600"
            >
              Create free account
            </ULink>
          </div>
        </template>
      </UCard>
    </UForm>
  </div>
</template>
