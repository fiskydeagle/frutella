<script setup lang="ts">
import { useSortable } from "@vueuse/integrations/useSortable";

type Props = {
  modelValue: any[];
};
const props = defineProps<Props>();

type EmitType = {
  (event: "update:modelValue", value: any[]): void;
};
const emit = defineEmits<EmitType>();

const sortableElement = ref<HTMLElement | null>(null);

const columns = ref<any[]>(props.modelValue);

onMounted(() => {
  nextTick(() => {
    useSortable(sortableElement, columns, {
      handle: ".handle",
      animation: 150,
    });
  });
});

watch(
  () => columns.value,
  (value) => {
    emit("update:modelValue", value);
  },
  { deep: true },
);
</script>

<template>
  <div ref="sortableElement" class="flex flex-col">
    <div
      v-for="columnItem in columns.filter((item) => item.key !== 'actions')"
      :key="'sortableElement-' + columnItem.key"
      class="w-full"
    >
      <div class="rounded bg-slate-100 p-2 flex items-center gap-2 my-1">
        <Icon
          class="handle cursor-grab block"
          name="uil:elipsis-double-v-alt"
          size="18"
        />
        <div class="mr-5">
          {{ columnItem.label }}
        </div>
        <UToggle v-model="columnItem.isVisible" class="ml-auto" />
      </div>
    </div>
  </div>
</template>
