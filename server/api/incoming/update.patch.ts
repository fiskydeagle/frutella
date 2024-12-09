import db from "@/models/index.js";
import Sequelize from "sequelize";
import { IncomingType } from "~/types";

interface Payload {
  id: number;
  description: string;
  type: IncomingType;
  value: number;
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

  const incoming = await db.Incomings.findOne({
    where: { id: body.id },
    attributes: ["id", "description", "type", "value", "updatedBy"],
  });

  if (!incoming) {
    throw createError({
      statusCode: 404,
      statusMessage: "components.incoming.update.toasts.incoming-not-found",
    });
  }

  try {
    return await incoming.update({
      description: body.description,
      type: body.type,
      value: body.type === IncomingType.Discount ? -1 * body.value : body.value,
      updatedBy: user.dataValues.id,
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
