import db from "@/models/index.js";
import bcrypt from "bcrypt";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  email: string;
}

const generateRandomPassword = () => {
  const length = Math.floor(Math.random() * 5) + 8; // Random length between 8 and 12
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
};

export default defineEventHandler(async (event) => {
  const body: Payload = await readBody(event);
  const password = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.Users.findOne({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.invalid-email",
    });
  }

  try {
    await user.update({
      password: hashedPassword,
    });

    await sendEmail({
      to: body.email,
      subject: "New Password",
      html: `${"New password:"} ${password}`,
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
