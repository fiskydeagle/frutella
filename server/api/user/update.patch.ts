import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  id: number;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export default defineEventHandler(async (event) => {
  if (
    !event.context.user ||
    !event.context.user.role ||
    event.context.user.role !== UserRole.ADMIN
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const body: Payload = await readBody(event);

  const user = await db.Users.findOne({
    where: { id: body.id },
    attributes: ["id", "firstName", "lastName", "role"],
    paranoid: false,
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "Something went wrong, please try again.",
    });
  }

  try {
    return await user.update({
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      updatedBy: event.context.user.id,
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
