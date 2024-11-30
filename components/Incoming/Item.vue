<script setup lang="ts">
import { ref, computed } from "vue";

// Reactive properties
const count = ref<number>(0);
const total = ref<number>(100); // Example total value

// Computed property for the current date
const currentDate = computed(() => {
  return new Date().toLocaleDateString(); // Format as needed
});
</script>
<template>
  <UCard>
    <template #header>
      <div class="grid grid-cols-2">
        <div>
          <p class="font-semibold text-lg">{{ currentDate }}</p>
          <p class="text-lg text-gray-600">Count: {{ count }}</p>
        </div>
        <div class="text-right">
          <UButton class="">Shto</UButton>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap justify-between">
        <h6 class="text-base">Firstname lastname</h6>
      </div>
    </div>

    <template #footer>
      <div class="text-3xl tracking-wide text-right">Total: {{ total }}$</div>
    </template>
  </UCard>
</template>
