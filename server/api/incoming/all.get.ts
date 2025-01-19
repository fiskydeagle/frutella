import db from "@/models/index.js";
import { UserRole } from "~/types";

interface Payload {
  limit: number;
  offset: number;
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

  const query: Payload = getQuery(event);

  try {
    const { count, rows: incomings } = await db.Incomings.findAndCountAll({
      limit: +query.offset + +query.limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          association: "createdByUser",
          attributes: [], // Exclude createdByUser attributes
          required: false,
        },
        {
          association: "updatedByUser",
          attributes: [], // Exclude updatedByUser attributes
          required: false,
        },
      ],
      paranoid: event.context.user.role !== UserRole.ADMIN,
      attributes: [
        [
          db.Sequelize.fn(
            "GROUP_CONCAT",
            db.Sequelize.literal(`
          CONCAT(
            '{"id":"', Incoming.id, 
            '","value":"', Incoming.value, 
            '","description":"', Incoming.description, 
            '","type":"', Incoming.type, 
            '","createdAt":"', Incoming.createdAt, 
            '","updatedAt":"', Incoming.updatedAt, 
            '","deletedAt":"', COALESCE(Incoming.deletedAt, ''), 
            '","createdBy":"', Incoming.createdBy, 
            '","updatedBy":"', Incoming.updatedBy, 
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
        [db.Sequelize.fn("SUM", db.Sequelize.col("value")), "total"],
        [db.Sequelize.fn("COUNT", db.Sequelize.col("Incoming.id")), "count"],
        [
          db.Sequelize.fn("DATE", db.Sequelize.col("Incoming.createdAt")),
          "createdAt",
        ],
      ],
      group: [db.Sequelize.fn("DATE", db.Sequelize.col("Incoming.createdAt"))],
    });

    return {
      count: count.length,
      data: incomings.map((incoming) => {
        const rows = JSON.parse(`[${incoming.dataValues.rows}]`).map(
          (row: any) => ({ ...row, id: +row.id, value: +row.value }),
        );
        const deletedRows = rows.filter(
          (row: { deletedAt: string }) => row.deletedAt,
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
      }),
      total: (await db.Incomings.sum("value")) || 0,
    };
  } catch (error: any) {
    return {
      count: 0,
      data: [],
      total: 0,
    };
  }
});
