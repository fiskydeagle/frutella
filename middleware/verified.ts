import { type User } from "~/types";

export default defineNuxtRouteMiddleware((to) => {
  const authTokenCookie = useCookie<string | undefined>("authToken");
  const user = useCookie<User | undefined>("user");
  if (!authTokenCookie.value || !user.value || !user.value.verified) {
    return navigateTo("/");
  }
});
