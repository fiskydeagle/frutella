import { jwtDecode } from "jwt-decode";
import db from "@/models/index.js";

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, "authToken");
  if (authToken) {
    try {
      const decodedToken: {
        id: number;
        email: string;
        exp: number;
        iat: number;
      } = jwtDecode(authToken);
      const currentTime = Date.now() / 1000;

      if (
        !decodedToken ||
        !decodedToken.exp ||
        decodedToken.exp < currentTime
      ) {
        deleteCookie(event, "authToken");
        deleteCookie(event, "user");
      } else {
        const user = await db.Users.findOne({
          where: {
            id: decodedToken.id,
            email: decodedToken.email,
          },
        });

        if (user) {
          setCookie(
            event,
            "user",
            JSON.stringify({ ...user.dataValues, password: null }),
          );
          event.context.user = { ...user.dataValues, password: null };
        } else {
          deleteCookie(event, "authToken");
          deleteCookie(event, "user");
        }
      }
    } catch (error: any) {}
  } else {
    deleteCookie(event, "user");
  }
});
