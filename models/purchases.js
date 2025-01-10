"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Purchases extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models["Purchases"].belongsTo(models["Products"], {
        foreignKey: "productId",
        as: "product",
      });
      models["Purchases"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Purchases"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
      models["Purchases"].belongsTo(models["Suppliers"], {
        foreignKey: "supplierId",
        as: "supplier",
      });
    }
  }

  Purchases.init(
    {
      productId: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      price: DataTypes.DOUBLE(10, 2),
      supplierId: DataTypes.INTEGER,
      date: DataTypes.DATEONLY,
    },
    {
      sequelize,
      modelName: "Purchases",
      paranoid: true,
    },
  );
  return Purchases;
};
