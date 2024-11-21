import { type User, UserRole } from "~/types";

export default defineNuxtRouteMiddleware((to) => {
  const authTokenCookie = useCookie<string | undefined>("authToken");
  const user = useCookie<User | undefined>("user");
  if (
    !authTokenCookie.value ||
    !user.value ||
    user.value.role !== UserRole.ADMIN
  ) {
    return navigateTo("/");
  }
});
