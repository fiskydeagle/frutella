import type { Product } from "~/types";
import { UnitType } from "~/types";

export const useProduct = () => {
  const toast = useToast();
  const i18n = useI18n();

  const products = ref<Product[]>();

  const getProducts = async () => {
    try {
      products.value = await $fetch("/api/product/all", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  const addProduct = async (state: {
    name: string | undefined;
    image: File[] | undefined;
    unitType: UnitType | undefined;
  }) => {
    const formData = new FormData();

    if (state.image && state.image.length)
      formData.append("image", state.image[0]);

    try {
      await $fetch("/api/product/add", {
        method: "POST",
        body: formData,
        query: state,
      });

      toast.add({
        title: i18n.t("components.product.add.toasts.product-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getProducts();
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

  const updateProduct = async (state: {
    id: number | undefined;
    name: string | undefined;
    imageLink: string | undefined;
    image: File[] | undefined;
    unitType: UnitType | undefined;
  }) => {
    const formData = new FormData();

    if (state.image && state.image.length)
      formData.append("image", state.image[0]);

    try {
      await $fetch("/api/product/update", {
        method: "PATCH",
        body: formData,
        query: state,
      });

      toast.add({
        title: i18n.t("components.product.update.toasts.product-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getProducts();
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

  const deactivateProduct = async (productId: number) => {
    try {
      await $fetch("/api/product/deactivate", {
        method: "PUT",
        body: {
          productId,
        },
      });

      toast.add({
        title: i18n.t("components.product.update.toasts.product-deactivated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getProducts();
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

  const restoreProduct = async (productId: number) => {
    try {
      await $fetch("/api/product/restore", {
        method: "PUT",
        body: {
          productId,
        },
      });

      toast.add({
        title: i18n.t("components.product.update.toasts.product-restored"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getProducts();
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

  const deleteProduct = async (productId: number) => {
    try {
      await $fetch("/api/product/delete", {
        method: "PUT",
        body: {
          productId,
        },
      });

      toast.add({
        title: i18n.t("components.product.update.toasts.product-deleted"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getProducts();
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
    products,
    getProducts,
    addProduct,
    updateProduct,
    deactivateProduct,
    restoreProduct,
    deleteProduct,
  };
};
