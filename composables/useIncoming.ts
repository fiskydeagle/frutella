import type { GroupedIncoming } from "~/types";

export const useIncoming = () => {
  const toast = useToast();
  const i18n = useI18n();

  const incomings = ref<GroupedIncoming[]>();

  const getIncomings = async () => {
    try {
      incomings.value = await $fetch("/api/incoming/all", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  return {
    incomings,
    getIncomings,
  };
};
