<script setup lang="ts">
import type { DataTableColumnsType } from "~/types";

const { compareKeyOfArrays } = useUtils();

type Props = {
  identifier: string;
  columns?: DataTableColumnsType[];
  dynamicColumns?: boolean;
};

const props = defineProps<Props>();

type EmitType = {
  (event: "onActionClick", data: { event: string; row: any }): void;
  (event: "onColumnChange", data: DataTableColumnsType[]): void;
};
const emits = defineEmits<EmitType>();

const columnsState = useCookie<DataTableColumnsType[]>(props.identifier);
const isColumnSettingsOpen = ref(false);

const columnsOrderVisibility = (props: Props): DataTableColumnsType[] => {
  if (!props.columns?.length) return [];

  if (
    columnsState.value &&
    props.dynamicColumns &&
    compareKeyOfArrays(
      columnsState.value.filter((item) => item.key !== "actions"),
      props.columns.filter((item) => item.key !== "actions"),
      "key",
    )
  ) {
    return [...columnsState.value];
  }

  if (props.columns?.length && props.dynamicColumns)
    return [
      ...props.columns.filter((item) => item.key !== "actions"),
      {
        label: "",
        key: "actions",
        isVisible: true,
        class: "w-1",
      },
    ];

  return [...props.columns];
};

const filteredColumns = ref<DataTableColumnsType[]>(
  columnsOrderVisibility(props),
);

watch(
  () => props,
  (value) => {
    filteredColumns.value = [...columnsOrderVisibility(value)];
  },
);

watch(
  () => filteredColumns.value,
  (value) => {
    columnsState.value = value;
    emits(
      "onColumnChange",
      value.filter((column: DataTableColumnsType) => column.key !== "actions"),
    );
  },
  { deep: true },
);

const attrs = {};

onMounted(() => {
  nextTick(() => {
    emits(
      "onColumnChange",
      filteredColumns.value.filter(
        (column: DataTableColumnsType) => column.key !== "actions",
      ),
    );
  });
});
</script>

<template>
  <UTable
    class="data-table text-inherit min-h-96"
    :columns="filteredColumns.filter((item) => item.isVisible)"
    v-bind="{ ...attrs, ...$attrs }"
  >
    <template
      v-for="(slot, index) of Object.keys($slots)"
      :key="index"
      #[slot]="slotData"
    >
      <slot :name="slot" v-bind="slotData" />
    </template>

    <template
      v-if="filteredColumns.length && dynamicColumns"
      #actions-header="{ column }"
    >
      <ClientOnly fallback-tag="span" fallback="Actions">
        <UPopover
          v-model:open="isColumnSettingsOpen"
          :title="column.label"
          class="flex justify-end [&>*]:block [&>*]:w-auto"
          :popper="{ placement: 'bottom-end' }"
        >
          <button
            class="flex justify-center items-center rounded text-neutral-500 hover:text-neutral-700"
          >
            <Icon name="fe:elipsis-v" class="text-3xl -my-2 -mx-1" />
          </button>
          <template #panel>
            <div class="flex flex-col rounded-2xl shadow-shadow-lg px-3 py-2">
              <DraggableOrder v-model="filteredColumns" />
            </div>
          </template>
        </UPopover>
      </ClientOnly>
    </template>

    <template v-if="filteredColumns.length" #actions-data="{ row }">
      <div @click.stop="">
        <ClientOnly
          v-if="row.actions && row.actions.length"
          fallback-tag="span"
          fallback="Actions"
        >
          <UPopover
            class="flex justify-end [&>*]:block [&>*]:w-auto"
            :popper="{ placement: 'bottom-end' }"
          >
            <button
              class="flex justify-center items-center rounded text-neutral-500 hover:text-neutral-700"
            >
              <Icon name="fe:elipsis-v" class="text-3xl -my-2 -mx-1" />
            </button>
            <template #panel="{ close }">
              <div class="flex flex-col rounded-2xl shadow-shadow-lg px-3 py-2">
                <button
                  v-for="action in row.actions"
                  :key="'action-btn-' + action.event"
                  type="button"
                  class="py-2 pr-6 pl-0 body-1 text-left flex gap-2 group/action"
                  @click.prevent="
                    close();
                    $emit('onActionClick', { event: action.event, row });
                  "
                >
                  <Icon
                    :name="action.icon"
                    size="20"
                    class="block text-neutral-500 group-hover/action:text-neutral-700"
                  />
                  {{ action.label }}
                </button>
              </div>
            </template>
          </UPopover>
        </ClientOnly>
        <template v-else> &nbsp; </template>
      </div>
    </template>
  </UTable>
</template>

<style lang="postcss" scoped>
.data-table :deep(*) {
  tr {
    position: relative;
  }
}
</style>
