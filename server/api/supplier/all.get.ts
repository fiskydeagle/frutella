import db from "@/models/index.js";
import { UserRole } from "~/types";

interface Payload {
  paranoid?: string | boolean;
}

export default defineEventHandler(async (event) => {
  if (
    !event.context.user ||
    !event.context.user.role ||
    ![UserRole.EMPLOYEE, UserRole.ADMIN].includes(event.context.user.role)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const query: Payload = await getQuery(event);
  query.paranoid = query.paranoid === "true";

  return db.Suppliers.findAll({
    include: ["createdByUser", "updatedByUser"],
    paranoid: query.paranoid,
  });
});
