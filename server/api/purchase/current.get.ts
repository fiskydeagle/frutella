import db from "@/models/index.js";
import { type Purchase, UserRole } from "~/types";
import { format } from "date-fns";

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
    const finalPurchases: Purchase[] = [];
    const ordersResponse = await db.Orders.findAll({
      order: [[{ model: db.Products, as: "product" }, "name", "DESC"]],
      where: {
        date: format(date, "yyyy-MM-dd"),
      },
      include: [
        {
          association: "product",
        },
      ],
      attributes: [
        [db.Sequelize.fn("SUM", db.Sequelize.col("orderQty")), "totalOrderQty"],
        [db.Sequelize.fn("DATE", db.Sequelize.col("Orders.date")), "date"],
        "productId",
      ],
      group: ["productId"],
    });

    const purchaseResponse = await db.Purchases.findAll({
      where: {
        date: format(date, "yyyy-MM-dd"),
      },
      include: [
        {
          association: "product",
          attributes: [], // Exclude product attributes
        },
      ],
    });

    for (const order of ordersResponse) {
      const purchases = purchaseResponse.filter(
        (item) => item.dataValues.productId === order.dataValues.productId,
      );
      if (purchases.length) {
        for (const purchase of purchases) {
          finalPurchases.push({
            ...order.dataValues,
            ...purchase.dataValues,
            splitId: null,
          });
        }
      } else {
        finalPurchases.push({
          ...order.dataValues,
          id: null,
          price: null,
          qty: null,
          supplierId: null,
          splitId: null,
        });
      }
    }

    return finalPurchases;
  } catch (e) {
    return [];
  }
});
