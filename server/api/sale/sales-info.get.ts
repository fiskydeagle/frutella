import db from "@/models/index.js";
import { OrderStatus, UserRole } from "~/types";
import { format } from "date-fns";

interface Payload {
  userId: number;
  date: number | string;
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

  const query: Payload = await getQuery(event);

  const date = new Date();
  const h = date.getHours();
  if (h < 4) {
    date.setDate(date.getDate() - 1);
  }

  try {
    const totalActiveOrders = await db.Orders.findAll({
      where: {
        date: query.date,
        status: OrderStatus.Processing,
      },
      attributes: [
        [db.sequelize.literal("SUM(orderQty)"), "totalOrderQty"],
        "productId",
      ],
      group: ["productId"],
    });

    const totalFinishedOrders = await db.Orders.findAll({
      where: {
        date: query.date,
        status: {
          [db.Sequelize.Op.or]: [OrderStatus.Done, OrderStatus.Canceled],
        },
      },
      attributes: [
        [db.sequelize.literal("SUM(orderQty)"), "totalOrderQty"],
        [db.sequelize.literal("SUM(qty)"), "totalQty"],
        "productId",
      ],
      group: ["productId"],
    });

    const ordersResponse = await db.Orders.findAll({
      where: {
        userId: query.userId,
        date: query.date,
      },
      attributes: [
        [db.sequelize.literal("SUM(orderQty)"), "orderQty"],
        [db.sequelize.literal("SUM(qty)"), "qty"],
        "productId",
      ],
      group: ["productId"],
    });

    const purchaseResponse = await db.Purchases.findAll({
      where: {
        date: format(date, "yyyy-MM-dd"),
      },
      attributes: [
        [db.sequelize.literal("SUM(orderQty)"), "totalOrderQty"],
        [db.sequelize.literal("SUM(qty)"), "totalQty"],
        [db.sequelize.literal("SUM(price * qty) / SUM(qty)"), "averagePrice"],
        [
          db.sequelize.literal("SUM(sellingPrice * qty) / SUM(qty)"),
          "averageSellingPrice",
        ],
        "productId",
      ],
      group: ["productId"],
    });

    return purchaseResponse.map((purchase) => {
      const foundActiveOrder = totalActiveOrders.find(
        (order) => order.dataValues.productId === purchase.dataValues.productId,
      );

      const foundFinishedOrder = totalFinishedOrders.find(
        (order) => order.dataValues.productId === purchase.dataValues.productId,
      );

      const foundOrder = ordersResponse.find(
        (order) => order.dataValues.productId === purchase.dataValues.productId,
      );

      let orderPercentage = 0;
      let percentage = 0;

      if (foundActiveOrder) {
        orderPercentage =
          (100 *
            (purchase.dataValues.totalOrderQty -
              +(foundFinishedOrder
                ? foundFinishedOrder.dataValues.totalOrderQty
                : 0))) /
          +foundActiveOrder.dataValues.totalOrderQty /
          100;

        percentage =
          (100 *
            (purchase.dataValues.totalQty -
              +(foundFinishedOrder
                ? foundFinishedOrder.dataValues.totalQty
                : 0))) /
          +foundActiveOrder.dataValues.totalQty /
          100;
      }

      const orderQty = foundOrder ? +foundOrder.dataValues.orderQty : 0;
      const qty = foundOrder ? +foundOrder.dataValues.qty : 0;

      return {
        ...purchase.dataValues,
        totalOrderQty: +purchase.dataValues.totalOrderQty,
        totalQty: +purchase.dataValues.totalQty,
        orderQty,
        maxOrderQty:
          +purchase.dataValues.totalOrderQty -
          (foundFinishedOrder
            ? +foundFinishedOrder.dataValues.totalOrderQty
            : 0),
        qty,
        maxQty:
          +purchase.dataValues.totalQty -
          (foundFinishedOrder ? +foundFinishedOrder.dataValues.totalQty : 0),
        orderPercentage,
        percentage,
        recommendedOrderQty:
          orderPercentage > 1
            ? orderQty
            : Math.ceil(orderQty * orderPercentage),
        recommendedQty: percentage > 1 ? qty : Math.ceil(qty * percentage),
      };
    });
  } catch (e) {
    return [];
  }
});
