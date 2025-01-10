import db from "@/models/index.js";
import Sequelize from "sequelize";
import { type OrderState, OrderStatus, UnitType, UserRole } from "~/types";
import { format } from "date-fns";

interface Payload {
  orders: OrderState[];
  userId: number;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const body: Payload = await readBody(event);

  if (![UserRole.EMPLOYEE, UserRole.ADMIN].includes(event.context.user.role)) {
    body.userId = event.context.user.id;
  }

  const date = new Date();
  const h = date.getHours();
  if (h > 3) {
    date.setDate(date.getDate() + 1);
  }

  const upsertOrders = body.orders.filter(
    (order) => !isNaN(+order.qty!) && +order.qty! > 0,
  );
  const removeOrders = body.orders.filter(
    (order) => !order.qty || +order.qty <= 0,
  );

  const rows = upsertOrders.map((order) => ({
    id: order.orderId || undefined,
    userId: body.userId,
    productId: order.productId,
    status: OrderStatus.Processing,
    orderQty: order.qty,
    date: format(date, "yyyy-MM-dd"),
    createdBy: event.context.user.id,
    updatedBy: event.context.user.id,
  }));

  try {
    await db.Orders.destroy({
      where: {
        id: {
          [Sequelize.Op.in]: removeOrders.map((item) => item.orderId),
        },
      },
    });

    return await db.Orders.bulkCreate(rows, {
      updateOnDuplicate: ["orderQty", "updatedBy"],
    });
  } catch (error: any) {
    if (error instanceof Sequelize.ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: "validations.wrong",
        data: error.errors.map((item) => item.message),
      });
    }
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }
});
