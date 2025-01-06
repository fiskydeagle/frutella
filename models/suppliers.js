"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Suppliers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["Suppliers"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Suppliers"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
    }
  }

  Suppliers.init(
    {
      company: DataTypes.STRING,
      image: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      city: DataTypes.STRING,
      address: DataTypes.STRING,
      tel: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Suppliers",
      paranoid: true,
    }
  );
  return Suppliers;
};
