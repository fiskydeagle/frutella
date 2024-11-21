<script setup lang="ts">
import { type InferType, object, string } from "yup";
import { UserRole } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

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

const schema = object({
  firstName: string().required("Required"),
  lastName: string().required("Required"),
  email: string().email("Invalid email").required("Required"),
  role: string().required("Required"),
  password: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  role: undefined,
  password: undefined,
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
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        role: undefined,
        password: undefined,
      });
    }
  },
);
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-md',
    }"
    class="max-w-md"
  >
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
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
            <h6 class="text-xl">Add User</h6>
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
          <UFormGroup size="lg" label="First Name" name="firstName">
            <UInput v-model="state.firstName" />
          </UFormGroup>

          <UFormGroup size="lg" label="Last Name" name="lastName">
            <UInput v-model="state.lastName" />
          </UFormGroup>

          <UFormGroup size="lg" label="Email" name="email">
            <UInput v-model="state.email" />
          </UFormGroup>

          <UFormGroup size="lg" label="Role" name="role">
            <USelectMenu
              v-model="state.role"
              :options="[
                {
                  id: UserRole.ADMIN,
                  label: 'Admin',
                },
                {
                  id: UserRole.EMPLOYEE,
                  label: 'Employee',
                },
                {
                  id: UserRole.CUSTOMER,
                  label: 'Customer',
                },
              ]"
              value-attribute="id"
              placeholder="Role"
            />
          </UFormGroup>

          <UFormGroup size="lg" label="Password" name="password">
            <UInput v-model="state.password" type="password" />
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
              Cancel
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              Add
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
