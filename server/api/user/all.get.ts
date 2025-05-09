import db from "@/models/index.js";
import { UserRole } from "~/types";

export default defineEventHandler(async (event) => {
  if (
    !event.context.user ||
    !event.context.user.role ||
    event.context.user.role !== UserRole.ADMIN
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }
  return db.Users.findAll({
    include: ["createdByUser", "updatedByUser", "userType"],
    order: [
      ["verified", "ASC"],
      ["createdAt", "DESC"],
    ],
    paranoid: false,
  });
});
