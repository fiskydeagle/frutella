import db from "@/models/index.js";
import { UserRole } from "~/types";

interface Payload {
  onlyVisible?: boolean;
}
export default defineEventHandler(async (event) => {
  if (
    !event.context.user ||
    !event.context.user.role ||
    ![UserRole.ADMIN, UserRole.EMPLOYEE].includes(event.context.user.role)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const query: Payload = await getQuery(event);

  return db.UserTypes.findAll({
    ...(query.onlyVisible
      ? {
          where: {
            isVisible: true,
          },
        }
      : {}),
  });
});
