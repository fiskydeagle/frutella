import type { User } from "~/types";

export const useAuthUser = () => {
  const toast = useToast();
  const router = useRouter();
  const i18n = useI18n();

  const authToken = useCookie<string | undefined>("authToken");
  const user = useCookie<User | undefined>("user");

  const register = async (state: {
    userTypeId: number | undefined;
    company: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    tel: string | undefined;
    password: string | undefined;
  }) => {
    try {
      await $fetch("/api/register", {
        method: "POST",
        body: state,
      });

      Object.assign(state, {
        userTypeId: undefined,
        company: undefined,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        tel: undefined,
        password: undefined,
      });

      toast.add({
        title: i18n.t("pages.login.toasts.registration-complete"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      router.push({
        name: "login",
      });
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });
    }
  };

  const login = async (state: {
    email: string | undefined;
    password: string | undefined;
  }) => {
    try {
      const authTokenResponse = await $fetch("/api/login", {
        method: "POST",
        body: state,
      });

      authToken.value = authTokenResponse;

      Object.assign(state, {
        email: undefined,
        password: undefined,
      });

      toast.add({
        title: i18n.t("pages.login.toasts.login-complete"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      router.push({
        name: "index",
      });
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });
    }
  };

  const recoverPassword = async (state: { email: string | undefined }) => {
    try {
      await $fetch("/api/recover-password", {
        method: "POST",
        body: state,
      });

      Object.assign(state, {
        email: undefined,
      });

      toast.add({
        title: i18n.t("pages.forgot-password.toasts.password-send-to-email"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      router.push({
        name: "login",
      });
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });
    }
  };

  const logout = () => {
    authToken.value = undefined;
    user.value = undefined;

    router.push({
      name: "login",
    });
  };
  return {
    authToken,
    user,

    register,
    login,
    recoverPassword,
    logout,
  };
};
