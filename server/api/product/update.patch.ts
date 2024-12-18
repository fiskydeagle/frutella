import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UnitType, UserRole } from "~/types";
import fs from "fs";
import path from "path";

interface Payload {
  id: number;
  name: string;
  imageLink: string;
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

  const envPath = process.env.SERVER_FILES_PATH || "public/uploads";

  const query: Payload = await getQuery(event);

  let filename;
  const dateNow = Date.now();
  const formData = await readMultipartFormData(event);

  if (formData && formData.length) {
    if (query.imageLink) {
      const imageLink = query.imageLink.split("/");
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

    const uploadedImage = formData.find((file) => file.name === "image");

    if (!uploadedImage || !uploadedImage.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: "validations.something-wrong",
      });
    }

    const uploadDir = path.resolve(`${envPath}/${dateNow}`);
    const filePath = path.join(uploadDir, uploadedImage.filename);

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the file
    fs.writeFileSync(filePath, uploadedImage.data);

    filename = uploadedImage.filename;
  }

  const product = await db.Products.findOne({
    where: { id: query.id },
    attributes: ["id", "name", "image", "unitType"],
    paranoid: false,
  });

  if (!product) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  try {
    if (filename) {
      return await product.update({
        name: query.name,
        image: `/${dateNow}/${filename}`,
        unitType: query.unitType,
        updatedBy: event.context.user.id,
      });
    } else {
      return await product.update({
        name: query.name,
        unitType: query.unitType,
        updatedBy: event.context.user.id,
      });
    }
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
