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
      models["Orders"].belongsToMany(models["Products"], {
        through: models["ProductsOrders"],
        foreignKey: "orderId",
        as: "products",
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
      status: DataTypes.BOOLEAN,
      payed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Orders",
      paranoid: true,
    },
  );
  return Orders;
};
