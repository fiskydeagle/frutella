import db from "@/models/index.js";
import bcrypt from "bcrypt";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  const body: Payload = await readBody(event);
  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    return await db.Users.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: UserRole.CUSTOMER,
      password: hashedPassword,
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
