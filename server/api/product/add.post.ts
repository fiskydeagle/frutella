import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UnitType, UserRole } from "~/types";
import fs from "fs";
import path from "path";

interface Payload {
  name: string;
  unitType: UnitType;
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

  const query: Payload = await getQuery(event);

  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  const uploadedImage = formData.find((file) => file.name === "image");

  if (!uploadedImage || !uploadedImage.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  const dateNow = Date.now();
  const uploadDir = path.resolve(`public/uploads/${dateNow}`);
  const filePath = path.join(uploadDir, uploadedImage.filename);

  // Ensure the directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Save the file
  fs.writeFileSync(filePath, uploadedImage.data);

  try {
    return await db.Products.create({
      name: query.name,
      image: `/uploads/${dateNow}/${uploadedImage.filename}`,
      unitType: query.unitType,
      createdBy: event.context.user.id,
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
