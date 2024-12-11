"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["Products"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Products"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
    }
  }

  Products.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      unitType: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Products",
      paranoid: true,
    },
  );
  return Products;
};
