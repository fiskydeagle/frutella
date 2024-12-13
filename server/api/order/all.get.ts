import db from "@/models/index.js";
import { UserRole } from "~/types";

export default defineEventHandler(async (event) => {
  if (!event.context.user || !event.context.user.role) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  try {
    return db.Orders.findAll({
      include: ["user", "products", "createdByUser", "updatedByUser"],
      paranoid: false,
    });
  } catch (e) {
    return [];
  }
});
