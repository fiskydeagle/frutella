import db from "@/models/index.js";
import bcrypt from "bcrypt";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
}

export default defineEventHandler(async (event) => {
  if (
    !event.context.user ||
    !event.context.user.role ||
    event.context.user.role !== UserRole.ADMIN
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not Authorized!",
    });
  }

  const body: Payload = await readBody(event);
  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    return await db.Users.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: body.role,
      password: hashedPassword,
      createdBy: event.context.user.id,
      updatedBy: event.context.user.id,
    });
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
