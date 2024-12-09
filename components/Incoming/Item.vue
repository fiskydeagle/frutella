<script setup lang="ts">
import type { GroupedIncoming, Incoming } from "~/types";
import { format } from "date-fns";

const i18n = useI18n();

type Props = {
  incoming: GroupedIncoming;
};
type EmitType = {
  (event: "onAdd", createdAt: string): void;
  (event: "onUpdate", incoming: Incoming): void;
  (event: "onDelete", incoming: Incoming): void;
};
defineProps<Props>();
const emits = defineEmits<EmitType>();
</script>
<template>
  <UCard
    v-if="incoming.createdAt"
    class="flex flex-col"
    :ui="{ body: { base: 'grow' } }"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <div>
          <h4 class="text-xl">
            {{ i18n.t("pages.incoming.date") }}:
            <span class="font-medium">{{
              format(new Date(incoming.createdAt), "dd.MM.yyyy")
            }}</span>
          </h4>
          <p>
            {{ i18n.t("pages.incoming.count") }}:
            <span class="font-medium">{{ incoming.count }}</span>
          </p>
        </div>
        <div>
          <UButton
            class="justify-center"
            size="lg"
            type="button"
            @click="emits('onAdd', incoming.createdAt)"
          >
            {{ i18n.t("pages.incoming.add") }}
          </UButton>
        </div>
      </div>
    </template>

    <UAccordion
      multiple
      color="gray"
      variant="soft"
      size="lg"
      :items="incoming.rows"
    >
      <template #default="{ item, index, open }">
        <UButton
          color="gray"
          variant="ghost"
          class="border-b border-gray-200 dark:border-gray-700"
          :class="{
            'bg-red-500 bg-opacity-20 hover:bg-red-500 hover:bg-opacity-40':
              item.deletedAt,
          }"
          :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }"
        >
          <div class="flex gap-x-3 justify-between w-full">
            <p>{{ index + 1 }}. {{ item.description }}</p>
            <p>{{ item.value }} €</p>
          </div>

          <template #trailing>
            <UIcon
              name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 ms-auto transform transition-transform duration-200"
              :class="[open && 'rotate-90']"
            />
          </template>
        </UButton>
      </template>
      <template #item="{ item }">
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 p-4 bg-gray-50"
        >
          <div class="flex gap-3 w-full justify-between">
            <p>
              <span class="font-medium">
                {{ i18n.t("pages.incoming.created-at") }}:
              </span>
            </p>
            <p class="text-right grow">
              {{ format(new Date(item.createdAt), "dd.MM.yyyy HH:mm") }}
            </p>
          </div>
          <div class="flex gap-3 w-full justify-between">
            <p>
              <span class="font-medium">
                {{ i18n.t("pages.incoming.created-by") }}:
              </span>
            </p>
            <p class="text-right grow">
              {{ item.createdByUserFirstName || "-" }}
              {{ item.createdByUserLastName || "-" }}
            </p>
          </div>

          <div class="flex gap-3 w-full justify-between">
            <p>
              <span class="font-medium">
                {{ i18n.t("pages.incoming.updated-at") }}:
              </span>
            </p>
            <p class="text-right grow">
              {{ format(new Date(item.updatedAt), "dd.MM.yyyy HH:mm") }}
            </p>
          </div>
          <div class="flex gap-3 w-full justify-between">
            <p>
              <span class="font-medium">
                {{ i18n.t("pages.incoming.updated-by") }}:
              </span>
            </p>
            <p class="text-right grow">
              {{ item.updatedByUserFirstName || "-" }}
              {{ item.updatedByUserLastName || "-" }}
            </p>
          </div>

          <template v-if="item.deletedAt">
            <div class="flex gap-3 w-full justify-between">
              <p>
                <span class="font-medium">
                  {{ i18n.t("pages.incoming.deleted-at") }}:
                </span>
              </p>
              <p class="text-right grow">
                {{ format(new Date(item.deletedAt), "dd.MM.yyyy HH:mm") }}
              </p>
            </div>
            <div class="flex gap-3 w-full justify-between">
              <p>
                <span class="font-medium">
                  {{ i18n.t("pages.incoming.deleted-by") }}:
                </span>
              </p>
              <p class="text-right grow">
                {{ item.updatedByUserFirstName || "-" }}
                {{ item.updatedByUserLastName || "-" }}
              </p>
            </div>
          </template>

          <div v-else class="md:col-span-2 flex flex-wrap gap-2 justify-end">
            <UButton
              class="justify-center"
              type="button"
              @click="emits('onUpdate', item)"
            >
              {{ i18n.t("pages.incoming.update") }}
            </UButton>
            <UButton
              class="justify-center"
              color="red"
              type="button"
              @click="emits('onDelete', item)"
            >
              {{ i18n.t("pages.incoming.delete") }}
            </UButton>
          </div>
        </div>
      </template>
    </UAccordion>

    <template #footer>
      <div class="flex justify-between items-baseline">
        <h3 class="text-2xl">{{ i18n.t("pages.incoming.total") }}:</h3>
        <h2 class="text-3xl">
          <span class="font-medium">{{ incoming.total.toFixed(2) }} €</span>
        </h2>
      </div>
    </template>
  </UCard>
</template>
