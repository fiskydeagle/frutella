"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Incoming extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["Incomings"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Incomings"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
    }
  }

  Incoming.init(
    {
      value: DataTypes.DOUBLE(10, 2),
      description: DataTypes.TEXT,
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Incoming",
      paranoid: true,
    },
  );
  return Incoming;
};
