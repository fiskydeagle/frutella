import db from "@/models/index.js";
import { UserRole } from "~/types";

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
  return db.Users.findAll({
    include: ["createdByUser", "updatedByUser"],
    order: [["createdAt", "DESC"]],
    where: {
      verified: true,
      role: UserRole.CUSTOMER,
    },
    paranoid: true,
  });
});
