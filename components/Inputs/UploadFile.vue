<script setup lang="ts">
import { useDropZone } from "@vueuse/core";
import { useUtils } from "~/composables/useUtils";

const i18n = useI18n();
const { formatBytes } = useUtils();

type EmitType = {
  (event: "update:modelValue" | "change", file: any): void;
};
const emit = defineEmits<EmitType>();

type Props = {
  modelValue: File[];
  label: string;
  accept?: string[];
  multiple?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  hideFileList?: boolean;
};

const props = defineProps<Props>();

const images = ref<{ key: string; value: string }[]>([]);
const file = ref<HTMLInputElement>();
const inputFileValue = ref(null);

const loadImages = () => {
  if (props.modelValue) {
    for (const file of props.modelValue) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result;
        if (
          base64String &&
          ["image/jpeg", "image/jpg", "image/gif", "image/png"].includes(
            file.type,
          )
        )
          images.value.push({ key: file.name, value: base64String as string });
        else images.value.push({ key: file.name, value: "" });
      };

      reader.readAsDataURL(file);
    }
  }
};

watch(
  () => props.modelValue,
  (value) => {
    if (!value.length) {
      inputFileValue.value = null;
    }

    loadImages();
  },
  { deep: true },
);

const dropZone = ref<HTMLInputElement>();
const onDrop = (f: File[] | null) => {
  if (!props.accept) {
    emit("update:modelValue", f);
    emit("change", f);
    return;
  }

  const files = [];

  if (props.accept && f?.length) {
    for (const fileItem of f) {
      if (props.accept.includes(fileItem.type)) files.push(fileItem);
    }
  }

  emit(
    "update:modelValue",
    props.multiple ? files : files[0] ? [files[0]] : [],
  );
  emit("change", props.multiple ? files : files[0] ? [files[0]] : []);
};
const onFilesChanged = (event: any) => {
  emit("update:modelValue", Object.values(event.target.files));
  emit("change", Object.values(event.target.files));
};

const { isOverDropZone } = useDropZone(dropZone, onDrop);

onMounted(() => {
  loadImages();
});
</script>

<template>
  <div class="flex flex-col items-center">
    <input
      ref="file"
      type="file"
      class="hidden"
      :value="inputFileValue"
      :accept="accept && accept.join(',')"
      :multiple="multiple"
      @change="onFilesChanged"
    />
    <button
      ref="dropZone"
      type="button"
      class="relative min-w-32 min-h-24 p-2 flex flex-col justify-center items-center gap-1 rounded border-dashed border border-neutral-300 hover:border-primary text-neutral-500 hover:text-primary"
      :class="{
        'border-primary text-primary': isOverDropZone,
        'w-full': fullWidth,
      }"
      :disabled="loading"
      @click="file && file.click()"
    >
      <template v-if="loading">
        <svg
          aria-hidden="true"
          class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-aqua-500"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </template>
      <template v-else>
        <Icon name="iconamoon:sign-plus-fill" size="50" />
        <span class="text-sm">{{ label }}</span>
      </template>
    </button>
    <span
      v-if="modelValue?.length && !hideFileList"
      class="flex flex-col text-neutral-500 mt-2 gap-y-2"
    >
      <span
        v-for="(item, index) in modelValue"
        :key="'file-' + index"
        class="text-xs flex gap-2 items-center"
      >
        <Icon
          name="material-symbols:cancel-outline"
          class="w-5 h-5 text-neutral-500 hover:text-primary cursor-pointer"
          @click.prevent="
            emit(
              'update:modelValue',
              modelValue.filter((fileItem) => fileItem.name !== item.name),
            );
            emit(
              'change',
              modelValue.filter((fileItem) => fileItem.name !== item.name),
            );
          "
        />
        <img
          v-if="item && images.find((img) => img.key === item.name)?.value"
          :src="images.find((img) => img.key === item.name)?.value"
          :alt="item.name"
          class="w-8 h-8 object-cover"
        />
        {{ item.name }}<br />
        {{ i18n.t("common.size") }}: {{ formatBytes(item.size) }}
      </span>
    </span>
  </div>
</template>
