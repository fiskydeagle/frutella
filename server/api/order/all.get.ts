import db from "@/models/index.js";
import { OrderStatus, UserRole } from "~/types";

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

  const date = new Date();
  const h = date.getHours();
  if (h < 4) {
    date.setDate(date.getDate() - 1);
  }

  try {
    const ordersResponse = await db.Orders.findAll({
      where: {
        date: {
          [db.Sequelize.Op.lte]: date,
        },
      },
      order: [
        [
          db.Sequelize.literal(`Orders.status = "${OrderStatus.Processing}"`),
          "DESC",
        ],
        ["date", "DESC"],
        [{ model: db.Users, as: "user" }, "sort", "ASC"],
      ],
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
            '","qty":"', COALESCE(Orders.qty, 0), 
            '","price":"', COALESCE(Orders.price, ''), 
            '","salePrice":"', COALESCE(Orders.salePrice, ''), 
            '","status":"', COALESCE(Orders.status, ''), 
            '","comment":"', COALESCE(Orders.comment, ''), 
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
        qty: +row.qty,
        price: +row.price,
        salePrice: +row.salePrice,
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
