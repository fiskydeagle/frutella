import db from "@/models/index.js";
import Sequelize from "sequelize";
import { type PurchaseState, UserRole, type Supplier } from "~/types";
import { format } from "date-fns";

interface Payload {
  purchases: PurchaseState[];
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

  let suppliers: Supplier[] = [];

  try {
    const suppliersResponse = await db.Suppliers.findAll({
      where: {
        company: {
          [Sequelize.Op.in]: body.purchases.map((item) => item.supplierName),
        },
      },
      attributes: ["id", "company"],
    });

    suppliers = suppliersResponse.map((item) => item.dataValues);

    const suppliersToCreate = body.purchases
      .map((item) => item.supplierName)
      .filter(
        (item) =>
          !suppliers.map((supplier) => supplier.company).includes(item) &&
          !!item,
      );

    if (suppliersToCreate && suppliersToCreate.length) {
      const newSuppliers = await db.Suppliers.bulkCreate(
        suppliersToCreate.map((item) => ({
          company: item,
        })),
        {
          ignoreDuplicates: true,
        },
      );

      for (const newSupplier of newSuppliers) {
        suppliers.push(newSupplier.dataValues);
      }
    }
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

  const date = new Date();
  const h = date.getHours();
  if (h < 4) {
    date.setDate(date.getDate() - 1);
  }

  const upsertPurchases = body.purchases.filter(
    (purchase) => !isNaN(+purchase.qty!) && +purchase.qty! > 0,
  );
  const removePurchases = body.purchases.filter(
    (purchase) => !purchase.qty || +purchase.qty <= 0,
  );

  const rows = upsertPurchases.map((purchase) => ({
    id: purchase.purchaseId || undefined,
    productId: purchase.productId,
    orderQty: purchase.orderQty,
    qty: purchase.qty,
    price: purchase.price,
    sellingPrice: purchase.sellingPrice,
    supplierId:
      suppliers.find((supplier) => supplier.company === purchase.supplierName)!
        .id || null,
    date: format(date, "yyyy-MM-dd"),
    createdBy: event.context.user.id,
    updatedBy: event.context.user.id,
  }));

  try {
    await db.Purchases.destroy({
      where: {
        id: {
          [Sequelize.Op.in]: removePurchases.map((item) => item.purchaseId),
        },
      },
    });

    return await db.Purchases.bulkCreate(rows, {
      updateOnDuplicate: [
        "orderQty",
        "qty",
        "price",
        "sellingPrice",
        "supplierId",
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
