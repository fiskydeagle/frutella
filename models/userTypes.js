"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class UserTypes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["UserTypes"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["UserTypes"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
    }
  }

  UserTypes.init(
    {
      name: DataTypes.STRING,
      percentage: DataTypes.DOUBLE(10, 2),
      isVisible: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "UserTypes",
    },
  );
  return UserTypes;
};
