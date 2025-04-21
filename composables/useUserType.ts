import type { UserType } from "~/types";

export const useUserType = () => {
  const toast = useToast();
  const i18n = useI18n();

  const userTypes = ref<UserType[]>();

  const getUserTypes = async (onlyVisible: boolean = false) => {
    try {
      userTypes.value = await $fetch("/api/user-type/all", {
        method: "GET",
        query: {
          ...(onlyVisible ? { onlyVisible: true } : {}),
        },
      });
    } catch (error: any) {}
  };

  const addUserType = async (state: {
    name: string | undefined;
    percentage: number | undefined;
    isVisible: boolean | undefined;
  }) => {
    try {
      await $fetch("/api/user-type/add", {
        method: "POST",
        body: state,
      });

      toast.add({
        title: i18n.t("components.user-type.add.toasts.user-type-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUserTypes();
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

  const updateUserType = async (state: {
    id: number | undefined;
    name: string | undefined;
    percentage: number | undefined;
    isVisible: boolean | undefined;
  }) => {
    try {
      await $fetch("/api/user-type/update", {
        method: "PATCH",
        body: state,
      });

      toast.add({
        title: i18n.t("components.user-type.update.toasts.user-type-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUserTypes();
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

  const deleteUserType = async (userTypeId: number) => {
    try {
      await $fetch("/api/user-type/delete", {
        method: "PUT",
        body: {
          userTypeId,
        },
      });

      toast.add({
        title: i18n.t("components.user-type.update.toasts.user-type-deleted"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUserTypes();
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
    userTypes,
    getUserTypes,
    addUserType,
    updateUserType,
    deleteUserType,
  };
};
