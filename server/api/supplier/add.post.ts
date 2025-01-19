import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole } from "~/types";
import fs from "fs";
import path from "path";

interface Payload {
  company: string;
  firstName: string;
  lastName: string;
  city: string;
  address: string;
  tel: string;
}

export default defineEventHandler(async (event) => {
  if (
    !event.context.user ||
    !event.context.user.role ||
    ![UserRole.EMPLOYEE, UserRole.ADMIN].includes(event.context.user.role)
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
    const uploadedImage = formData.find((file) => file.name === "image");

    if (!uploadedImage || !uploadedImage.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: "validations.something-wrong",
      });
    }

    const uploadDir = path.resolve(`${envPath}/suppliers/${dateNow}`);
    const filePath = path.join(uploadDir, uploadedImage.filename);

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the file
    fs.writeFileSync(filePath, uploadedImage.data);
    filename = uploadedImage.filename;
  }

  try {
    if (filename) {
      return await db.Suppliers.create({
        company: query.company,
        image: `/suppliers/${dateNow}/${filename}`,
        firstName: query.firstName,
        lastName: query.lastName,
        city: query.city,
        address: query.address,
        tel: query.tel,
        createdBy: event.context.user.id,
        updatedBy: event.context.user.id,
      });
    } else {
      return await db.Suppliers.create({
        company: query.company,
        image: filename,
        firstName: query.firstName,
        lastName: query.lastName,
        city: query.city,
        address: query.address,
        tel: query.tel,
        createdBy: event.context.user.id,
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
