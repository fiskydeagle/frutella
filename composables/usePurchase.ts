import type { GroupedPurchase, Purchase, PurchaseState } from "~/types";

export const usePurchase = () => {
  const toast = useToast();
  const i18n = useI18n();

  const purchases = ref<GroupedPurchase[]>();
  const getPurchases = async () => {
    try {
      purchases.value = await $fetch("/api/purchase/all", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  const currentPurchases = ref<Purchase[]>();
  const getCurrentPurchases = async () => {
    try {
      currentPurchases.value = await $fetch("/api/purchase/current", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  const addPurchase = async (state: PurchaseState[]) => {
    try {
      await $fetch("/api/purchase/add", {
        method: "POST",
        body: {
          purchases: state,
        },
      });

      toast.add({
        title: i18n.t("components.order.add.toasts.order-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getPurchases();
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
    purchases,
    getPurchases,
    currentPurchases,
    getCurrentPurchases,
    addPurchase,
  };
};
