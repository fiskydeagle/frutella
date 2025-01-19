import db from "@/models/index.js";
import Sequelize from "sequelize";
import { OrderStatus, type SaleState, UserRole } from "~/types";

interface Payload {
  sales: SaleState[];
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

  const body: Payload = await readBody(event);

  let status = OrderStatus.Canceled;

  for (const sale of body.sales) {
    if (+sale.qty > 0) {
      status = OrderStatus.Done;
      break;
    }
  }

  const rows = body.sales.map((sale) => ({
    id: sale.id,
    qty: sale.qty,
    comment: sale.comment,
    price: sale.price,
    salePrice: sale.salePrice,
    status,
    updatedBy: event.context.user.id,
  }));

  try {
    return await db.Orders.bulkCreate(rows, {
      updateOnDuplicate: [
        "qty",
        "comment",
        "price",
        "salePrice",
        "status",
        "updatedBy",
      ],
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
