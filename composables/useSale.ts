import type {
  GroupedOrder,
  Order,
  OrderState,
  SaleInfo,
  SaleState,
  User,
} from "~/types";

export const useSale = () => {
  const toast = useToast();
  const i18n = useI18n();

  const searchWord = ref<string>();
  const orderUser = ref<User | undefined>(undefined);

  const orders = ref<GroupedOrder[]>();
  const getOrders = async () => {
    try {
      orders.value = await $fetch("/api/order/all", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  const salesInfo = ref<SaleInfo[]>();
  const getSalesInfo = async (
    userId: string | number,
    date: string | number,
  ) => {
    try {
      salesInfo.value = await $fetch("/api/sale/sales-info", {
        method: "GET",
        query: {
          userId,
          date,
        },
      });
    } catch (error: any) {}
  };

  const sell = async (state: SaleState[]) => {
    try {
      await $fetch("/api/sale/sell", {
        method: "POST",
        body: {
          sales: state,
        },
      });

      toast.add({
        title: i18n.t("components.sales.sale.toasts.action-success"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getOrders();
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
    searchWord,
    orderUser,
    orders,
    getOrders,
    getSalesInfo,
    salesInfo,
    sell,
  };
};
