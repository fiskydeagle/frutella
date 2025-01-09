import db from "@/models/index.js";
import { UnitType, UserRole } from "~/types";

interface Payload {
  paranoid?: string | boolean;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const query: Payload = await getQuery(event);
  query.paranoid = query.paranoid === "true";

  if (
    !event.context.user.role ||
    ![UserRole.ADMIN, UserRole.EMPLOYEE].includes(event.context.user.role)
  ) {
    query.paranoid = true;
  }

  return db.Products.findAll({
    include: ["createdByUser", "updatedByUser"],
    order: [["name", "ASC"]],
    paranoid: query.paranoid,
  });
});
