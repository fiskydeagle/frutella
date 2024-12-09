import db from "@/models/index.js";
import Sequelize from "sequelize";

interface Payload {
  firstName: string;
  lastName: string;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const body: Payload = await readBody(event);

  const user = await db.Users.findOne({
    where: { id: event.context.user.id },
    attributes: ["id", "firstName", "lastName"],
    paranoid: false,
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "validations.user-not-found",
    });
  }

  try {
    return await user.update(
      {
        firstName: body.firstName,
        lastName: body.lastName,
      },
      { silent: true },
    );
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
