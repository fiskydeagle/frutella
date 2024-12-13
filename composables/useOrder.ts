import type { Order } from "~/types";

export const useOrder = () => {
  const orders = ref<Order[]>();
  const getOrders = async () => {
    try {
      orders.value = await $fetch("/api/order/all", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  return {
    orders,
    getOrders,
  };
};
