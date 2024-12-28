import db from "@/models/index.js";
import bcrypt from "bcrypt";
import Sequelize from "sequelize";
import { UserRole } from "~/types";
import path from "path";
import fs from "fs";

interface Payload {
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
  city: string;
  address: string;
  tel: string;
  googleMap: string;
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
  const hashedPassword = await bcrypt.hash(query.password, 10);

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

    const uploadDir = path.resolve(`${envPath}/products/${dateNow}`);
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
      return await db.Users.create({
        company: query.company,
        firstName: query.firstName,
        lastName: query.lastName,
        email: query.email,
        role: query.role,
        password: hashedPassword,
        image: `/products/${dateNow}/${filename}`,
        city: query.city,
        address: query.address,
        tel: query.tel,
        googleMap: query.googleMap,
        createdBy: event.context.user.id,
        updatedBy: event.context.user.id,
      });
    } else {
      return await db.Users.create({
        company: query.company,
        firstName: query.firstName,
        lastName: query.lastName,
        email: query.email,
        role: query.role,
        password: hashedPassword,
        city: query.city,
        address: query.address,
        tel: query.tel,
        googleMap: query.googleMap,
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
