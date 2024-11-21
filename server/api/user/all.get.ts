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
      statusMessage: "Not Authorized!",
    });
  }
  return db.Users.findAll({
    include: ["createdByUser", "updatedByUser"],
    paranoid: false,
  });
});
