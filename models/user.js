"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["Users"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Users"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
    }
  }

  User.init(
    {
      sort: DataTypes.INTEGER,
      company: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true, // Validates the email format
        },
      },
      image: DataTypes.STRING,
      city: DataTypes.STRING,
      address: DataTypes.STRING,
      tel: DataTypes.STRING,
      googleMap: DataTypes.STRING,
      role: DataTypes.STRING,
      verified: DataTypes.BOOLEAN,
      inOwnership: DataTypes.BOOLEAN,
      password: {
        type: DataTypes.STRING,
        get() {
          return "";
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      paranoid: true,
    },
  );
  return User;
};
