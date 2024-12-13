"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class ProductsOrders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  ProductsOrders.init(
    {
      productId: DataTypes.INTEGER,
      orderId: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      price: DataTypes.DOUBLE(10, 2),
    },
    {
      sequelize,
      modelName: "productsOrders",
      timestamps: false,
    },
  );
  return ProductsOrders;
};
