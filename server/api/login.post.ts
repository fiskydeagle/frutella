import db from "@/models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql2";

interface Payload {
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
  });

  // Close the connection immediately
  connection.destroy();

  const body: Payload = await readBody(event);

  const user = await db.Users.findOne({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.invalid-email-password",
    });
  }

  const validPassword = await bcrypt.compare(
    body.password,
    user.dataValues.password,
  );

  if (!validPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.invalid-email-password",
    });
  }

  try {
    const jwtToken = jwt.sign(
      { id: user.dataValues.id, email: user.dataValues.email },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }, // Token expires in 365 days
    );

    setCookie(event, "authToken", jwtToken);
    setCookie(
      event,
      "user",
      JSON.stringify({ ...user.dataValues, password: null }),
    );

    return jwtToken;
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }
});
