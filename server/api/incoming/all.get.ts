import db from "@/models/index.js";
import { UserRole } from "~/types";
import { Op } from "sequelize";

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
    const incomings = await db.Incomings.findAll({
      limit: 2,
      include: [
        {
          model: db.Users,
          as: "createdByUser",
          attributes: ["id"],
          required: false,
        },
        {
          model: db.Users,
          as: "updatedByUser",
          attributes: ["id"],
          required: false,
        },
      ],
      paranoid: event.context.user.role !== UserRole.ADMIN,
      attributes: [
        [
          db.Sequelize.fn(
            "GROUP_CONCAT", // Aggregate fields into an array
            db.Sequelize.literal(`
              CONCAT
              (
                '{
                  "id": "', Incoming.id, '", ','
                  "value": "', Incoming.value, '", ','
                  "description": "', Incoming.description, '", ','
                  "type": "', Incoming.type, '", ','
                  "createdAt": "', Incoming.createdAt, '", ','
                  "updatedAt": "', Incoming.updatedAt, '", ','
                  "deletedAt": "', COALESCE(Incoming.deletedAt, ''), '", ','
                  "createdBy": "', Incoming.createdBy, '", ','
                  "updatedBy": "', Incoming.updatedBy, '", ','
                  
                  "createdByUserFirstName": "', COALESCE(createdByUser.firstName, ''), '", ','
                  "createdByUserLastName": "', COALESCE(createdByUser.lastName, ''), '", ','
                  "updatedByUserFirstName": "', COALESCE(updatedByUser.firstName, ''), '", ','
                  "updatedByUserLastName": "', COALESCE(updatedByUser.lastName, ''), '"
                }'
              )
            `)
          ),
          "rows",
        ],
        [db.Sequelize.fn("SUM", db.Sequelize.col("value")), "total"],
        [db.Sequelize.fn("COUNT", "*"), "count"],
      ],
      group: [db.Sequelize.fn("DATE", db.Sequelize.col("Incoming.createdAt"))],
    });

    return incomings.map((incoming) => {
      const rows = JSON.parse(`[${incoming.dataValues.rows}]`).map(
        (row: any) => ({ ...row, value: +row.value })
      );
      const deletedRows = rows.filter(
        (row: { deletedAt: string }) => row.deletedAt
      );

      const minusTotal =
        deletedRows && deletedRows.length
          ? deletedRows
              .map((row: { value: string }) => +row.value)
              .reduce((accumulator: number, currentValue: number) => {
                return accumulator + currentValue;
              }, 0)
          : 0;

      return {
        ...incoming.dataValues,
        rows,
        total: +(incoming.dataValues.total - minusTotal).toFixed(2),
      };
    });
  } catch (error: any) {
    return [];
  }
});
