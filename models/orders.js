"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["Orders"].belongsTo(models["Users"], {
        foreignKey: "userId",
        as: "user",
      });
      models["Orders"].belongsTo(models["Products"], {
        foreignKey: "productId",
        as: "product",
      });
      models["Orders"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Orders"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
    }
  }

  Orders.init(
    {
      userId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      orderQty: DataTypes.DOUBLE(10, 2),
      qty: DataTypes.DOUBLE(10, 2),
      price: DataTypes.DOUBLE(10, 2),
      salePrice: DataTypes.DOUBLE(10, 2),
      comment: DataTypes.STRING,
      date: DataTypes.DATEONLY,
    },
    {
      sequelize,
      modelName: "Orders",
    },
  );
  return Orders;
};
