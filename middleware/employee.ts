import { type User, UserRole } from "~/types";

export default defineNuxtRouteMiddleware((to) => {
  const authTokenCookie = useCookie<string | undefined>("authToken");
  const user = useCookie<User | undefined>("user");
  if (
    !authTokenCookie.value ||
    !user.value ||
    ![UserRole.EMPLOYEE, UserRole.ADMIN].includes(user.value.role)
  ) {
    return navigateTo("/");
  }
});
