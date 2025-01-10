import db from "@/models/index.js";
import { UserRole } from "~/types";

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

  try {
    const ordersResponse = await db.Orders.findAll({
      order: [["date", "DESC"]],
      where: {
        userId: query.userId,
      },
      include: [
        "user",
        {
          association: "product",
          attributes: [], // Exclude product attributes
        },
        {
          association: "createdByUser",
          attributes: [], // Exclude createdByUser attributes
        },
        {
          association: "updatedByUser",
          attributes: [], // Exclude updatedByUser attributes
        },
      ],
      attributes: [
        [
          db.Sequelize.fn(
            "GROUP_CONCAT",
            db.Sequelize.literal(`
          CONCAT(
            '{"id":"', Orders.id, 
            '","orderQty":"', Orders.orderQty, 
            '","date":"', Orders.date, 
            '","createdAt":"', Orders.createdAt, 
            '","updatedAt":"', Orders.updatedAt,
            '","createdBy":"', Orders.createdBy, 
            '","updatedBy":"', Orders.updatedBy, 
            '","productId":"', COALESCE(product.id, ''), 
            '","productName":"', COALESCE(product.name, ''), 
            '","productImage":"', COALESCE(product.image, ''), 
            '","productUnitType":"', COALESCE(product.unitType, ''), 
            '","createdByUserFirstName":"', COALESCE(createdByUser.firstName, ''), 
            '","createdByUserLastName":"', COALESCE(createdByUser.lastName, ''), 
            '","updatedByUserFirstName":"', COALESCE(updatedByUser.firstName, ''), 
            '","updatedByUserLastName":"', COALESCE(updatedByUser.lastName, ''), 
            '"}'
          )
        `),
          ),
          "rows",
        ],
        "status",
        [db.Sequelize.fn("DATE", db.Sequelize.col("Orders.date")), "date"],
      ],
      group: ["date", "userId"],
    });
    return ordersResponse.map((order) => {
      const rows = JSON.parse(`[${order.dataValues.rows}]`).map((row: any) => ({
        ...row,
        id: +row.id,
        orderQty: +row.orderQty,
        productId: +row.productId,
      }));
      return {
        ...order.dataValues,
        rows,
      };
    });
  } catch (e) {
    return [];
  }
});
