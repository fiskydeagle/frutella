import db from "@/models/index.js";
import Sequelize from "sequelize";
import path from "path";
import fs from "fs";

interface Payload {
  company: string;
  firstName: string;
  lastName: string;
  imageLink: string;
  deleteImage: string | boolean;
  city: string;
  address: string;
  tel: string;
  googleMap: string;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const envPath = process.env.SERVER_FILES_PATH || "public/uploads";

  const query: Payload = await getQuery(event);
  query.deleteImage = query.deleteImage === "true";

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

    const uploadDir = path.resolve(`${envPath}/users/${dateNow}`);
    const filePath = path.join(uploadDir, uploadedImage.filename);

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the file
    fs.writeFileSync(filePath, uploadedImage.data);

    filename = uploadedImage.filename;
  } else if (query.imageLink && query.deleteImage) {
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

  const user = await db.Users.findOne({
    where: { id: event.context.user.id },
    attributes: ["id", "image"],
    paranoid: false,
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "validations.user-not-found",
    });
  }

  try {
    if (filename) {
      return await user.update(
        {
          company: query.company,
          firstName: query.firstName,
          lastName: query.lastName,
          image: `/users/${dateNow}/${filename}`,
          city: query.city,
          address: query.address,
          tel: query.tel,
          googleMap: query.googleMap,
        },
        { silent: true },
      );
    } else {
      return await user.update(
        {
          company: query.company,
          firstName: query.firstName,
          lastName: query.lastName,
          image: query.deleteImage ? null : user.dataValues.image,
          city: query.city,
          address: query.address,
          tel: query.tel,
          googleMap: query.googleMap,
        },
        { silent: true },
      );
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
