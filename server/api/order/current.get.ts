import db from "@/models/index.js";
import { UserRole } from "~/types";
import { format } from "date-fns";

interface Payload {
  userId: number;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const query: Payload = await getQuery(event);

  if (![UserRole.EMPLOYEE, UserRole.ADMIN].includes(event.context.user.role)) {
    query.userId = event.context.user.id;
  }

  const date = new Date();
  const h = date.getHours();
  if (h > 3) {
    date.setDate(date.getDate() + 1);
  }

  try {
    return db.Orders.findAll({
      where: {
        userId: query.userId,
        date: format(date, "yyyy-MM-dd"),
      },
    });
  } catch (e) {
    return [];
  }
});
