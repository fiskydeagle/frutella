import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole } from "~/types";
import fs from "fs";
import path from "path";

interface Payload {
  id: number;
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

  const envPath = process.env.SERVER_FILES_PATH || "public/uploads";

  const body: Payload = await readBody(event);

  const supplier = await db.Suppliers.findOne({
    where: { id: body.id },
    attributes: ["id", "image"],
    paranoid: false,
  });

  if (!supplier) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  if (supplier.dataValues.image) {
    const imageLink = supplier.dataValues.image.split("/");
    imageLink.pop();
    const deleteFilePath = imageLink.join("/");

    const filePath = path.resolve(`${envPath}${deleteFilePath}`);

    try {
      if (fs.existsSync(filePath)) {
        fs.rmdirSync(filePath, { recursive: true });
      }
    } catch (error: any) {
      throw createError({
        statusCode: 400,
        statusMessage: "validations.something-wrong",
      });
    }
  }

  try {
    return await supplier.destroy({ force: true });
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
