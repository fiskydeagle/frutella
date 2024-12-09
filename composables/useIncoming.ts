import type { GroupedIncoming } from "~/types";
import { IncomingType, UserRole } from "~/types";

export const useIncoming = () => {
  const toast = useToast();
  const i18n = useI18n();

  const items = ref<GroupedIncoming[]>([]);
  const count = ref<number>(0);
  const page = ref<number>(0);
  const total = ref<number>(0);
  const limit = ref<number>(1);

  const getIncomings = async () => {
    try {
      const {
        count: countValue,
        data,
        total: totalValue,
      } = await $fetch("/api/incoming/all", {
        method: "GET",
        query: {
          limit: limit.value,
          offset: page.value * limit.value,
        },
      });
      items.value = data;
      count.value = countValue;
      total.value = totalValue;
    } catch (error: any) {}
  };

  const addIncoming = async (state: {
    description: string | undefined;
    type: IncomingType | undefined;
    value: string | undefined;
    createdAt: string | undefined;
  }) => {
    try {
      await $fetch("/api/incoming/add", {
        method: "POST",
        body: state,
      });

      toast.add({
        title: i18n.t("components.incoming.add.toasts.incoming-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getIncomings();
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });

      return false;
    }
    return true;
  };

  const updateIncoming = async (state: {
    id: string | undefined;
    description: string | undefined;
    type: IncomingType | undefined;
    value: string | undefined;
  }) => {
    try {
      await $fetch("/api/incoming/update", {
        method: "PATCH",
        body: state,
      });

      toast.add({
        title: i18n.t("components.incoming.update.toasts.incoming-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getIncomings();
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });

      return false;
    }
    return true;
  };

  const deleteIncoming = async (state: { id: string | undefined }) => {
    try {
      await $fetch("/api/incoming/delete", {
        method: "PUT",
        body: state,
      });

      toast.add({
        title: i18n.t("components.incoming.delete.toasts.incoming-deleted"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getIncomings();
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });

      return false;
    }
    return true;
  };

  return {
    items,
    total,
    count,
    page,
    getIncomings,
    addIncoming,
    updateIncoming,
    deleteIncoming,
  };
};
