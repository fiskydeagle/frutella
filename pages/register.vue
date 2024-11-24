<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";
import { useAuthUser } from "~/composables/useAuthUser";

useHead(() => {
  return {
    title: "Frutella - Register",
    meta: [
      {
        name: "description",
        content: "Register Page.",
      },
    ],
  };
});

const { register } = useAuthUser();

const schema = object({
  firstName: string().required("Required"),
  lastName: string().required("Required"),
  email: string().email("Invalid email").required("Required"),
  password: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  password: undefined,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await register(state);
};
</script>

<template>
  <div class="max-w-screen-sm m-auto">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UCard>
        <template #header>
          <h1 class="text-xl">Register</h1>
        </template>

        <div class="flex flex-col gap-4">
          <UFormGroup size="lg" label="First Name" name="firstName">
            <UInput v-model="state.firstName" />
          </UFormGroup>

          <UFormGroup size="lg" label="Last Name" name="lastName">
            <UInput v-model="state.lastName" />
          </UFormGroup>

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
              Register
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </div>
</template>
