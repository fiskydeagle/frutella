import type { GroupedOrder, Order, OrderState, User } from "~/types";

export const useOrder = () => {
  const toast = useToast();
  const i18n = useI18n();

  const orderUser = ref<User | undefined>(undefined);

  const orders = ref<GroupedOrder[]>();
  const getOrders = async () => {
    try {
      orders.value = await $fetch("/api/order/all", {
        method: "GET",
        query: {
          userId: orderUser.value?.id,
        },
      });
    } catch (error: any) {}
  };

  const currentOrders = ref<Order[]>();
  const getCurrentOrders = async () => {
    try {
      currentOrders.value = await $fetch("/api/order/current", {
        method: "GET",
        query: {
          userId: orderUser.value?.id,
        },
      });
    } catch (error: any) {}
  };

  const addOrder = async (state: OrderState[], userId: number | string) => {
    try {
      await $fetch("/api/order/add", {
        method: "POST",
        body: {
          orders: state,
          userId,
        },
      });

      toast.add({
        title: i18n.t("components.order.add.toasts.order-added"),
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
    orderUser,
    orders,
    getOrders,
    currentOrders,
    getCurrentOrders,
    addOrder,
  };
};
