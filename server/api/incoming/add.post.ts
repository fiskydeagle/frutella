import db from "@/models/index.js";
import Sequelize from "sequelize";
import { IncomingType } from "~/types";

interface Payload {
  description: string;
  type: IncomingType;
  value: number;
  createdAt?: string;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.user-not-found",
    });
  }

  const user = await db.Users.findOne({
    where: { id: event.context.user.id },
    attributes: ["id"],
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "validations.user-not-found",
    });
  }

  const body: Payload = await readBody(event);

  try {
    return await db.Incomings.create({
      description: body.description,
      type: body.type,
      value: body.type === IncomingType.Discount ? -1 * body.value : body.value,
      createdBy: user.dataValues.id,
      updatedBy: user.dataValues.id,
      createdAt: body.createdAt || undefined,
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
