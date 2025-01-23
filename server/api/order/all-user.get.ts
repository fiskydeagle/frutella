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

  try {
    const purchasesResponse = await db.Purchases.findAll({
      attributes: [
        [db.sequelize.literal("SUM(price * qty) / SUM(qty)"), "averagePrice"],
        "productId",
        "date",
      ],
      group: ["productId", "date"],
    });

    await db.sequelize.query("SET SESSION group_concat_max_len = 100000000;");
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
          ORDER BY product.name ASC
        `),
          ),
          "rows",
        ],
        "status",
        [db.Sequelize.fn("DATE", db.Sequelize.col("Orders.date")), "date"],
      ],
      group: ["date", "userId", "status"],
    });

    return ordersResponse.map((order) => {
      const rows = JSON.parse(`[${order.dataValues.rows}]`).map((row: any) => {
        const foundPurchase = purchasesResponse.find(
          (item) =>
            +item.dataValues.productId === +row.productId &&
            item.dataValues.date === row.date,
        );

        return {
          ...row,
          id: +row.id,
          orderQty: +row.orderQty,
          qty: +row.qty,
          price: +row.price,
          salePrice: +row.salePrice,
          prepareSalePrice: foundPurchase
            ? foundPurchase.dataValues.averagePrice *
              +(order.dataValues.user.sellingPercentage || 0)
            : 0,
          productId: +row.productId,
        };
      });
      return {
        ...order.dataValues,
        rows,
      };
    });
  } catch (e) {
    return [];
  }
});
