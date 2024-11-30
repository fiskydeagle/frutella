import db from "@/models/index.js";
import Sequelize from "sequelize";
import bcrypt from "bcrypt";

interface Payload {
  oldPassword: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not Authorized!",
    });
  }

  const body: Payload = await readBody(event);

  const user = await db.Users.findOne({
    where: { id: event.context.user.id },
    attributes: ["id", "password"],
    paranoid: false,
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "validations.user-not-found",
    });
  }

  const validPassword = await bcrypt.compare(
    body.oldPassword,
    user.dataValues.password,
  );

  if (!validPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.invalid-old-password",
    });
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    return await user.update(
      {
        password: hashedPassword,
      },
      { silent: true },
    );
  } catch (error: any) {
    if (error instanceof Sequelize.ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Something went wrong.",
        data: error.errors.map((item) => item.message),
      });
    }
    throw createError({
      statusCode: 400,
      statusMessage: "Something went wrong, please try again.",
    });
  }
});
