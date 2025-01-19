import db from "@/models/index.js";
import { UserRole } from "~/types";
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

  try {
    const purchasesResponse = await db.Purchases.findAll({
      order: [["date", "DESC"]],
      include: [
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
        {
          association: "supplier",
          attributes: [], // Exclude product attributes
        },
      ],
      attributes: [
        [
          db.Sequelize.fn(
            "GROUP_CONCAT",
            db.Sequelize.literal(`
          CONCAT(
            '{"id":"', Purchases.id, 
            '","qty":"', Purchases.qty, 
            '","price":"', Purchases.price, 
            '","date":"', Purchases.date, 
            '","createdAt":"', Purchases.createdAt, 
            '","updatedAt":"', Purchases.updatedAt,
            '","createdBy":"', Purchases.createdBy, 
            '","updatedBy":"', Purchases.updatedBy, 
            '","productId":"', COALESCE(product.id, ''), 
            '","productName":"', COALESCE(product.name, ''), 
            '","productImage":"', COALESCE(product.image, ''), 
            '","productUnitType":"', COALESCE(product.unitType, ''), 
            '","supplierId":"', COALESCE(supplier.id, ''), 
            '","supplierName":"', COALESCE(supplier.company, ''), 
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
        [db.Sequelize.fn("DATE", db.Sequelize.col("Purchases.date")), "date"],
      ],
      group: ["date"],
    });

    return purchasesResponse.map((purchase) => {
      const rows = JSON.parse(`[${purchase.dataValues.rows}]`).map(
        (row: any) => ({
          ...row,
          id: +row.id,
          qty: +row.qty,
          price: +row.price,
          productId: +row.productId,
          supplierId: +row.supplierId,
        }),
      );
      return {
        ...purchase.dataValues,
        rows,
      };
    });
  } catch (e) {
    return [];
  }
});
