<script setup lang="ts">
import { useAuthUser } from "~/composables/useAuthUser";

const { logout } = useAuthUser();

logout();
</script>

<template>
  <div></div>
</template>
