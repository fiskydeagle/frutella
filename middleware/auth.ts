export default defineNuxtRouteMiddleware((to) => {
  const authTokenCookie = useCookie<string | undefined>("authToken");
  if (!authTokenCookie.value) {
    return navigateTo("/login");
  }
});
