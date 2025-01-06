"use strict";

import Sequelize, { DataTypes } from "sequelize";
import allConfig from "~~/config/config.json";

// import all models
import User from "./user.js";
import Incoming from "./incomings.js";
import Products from "./products.js";
import Suppliers from "./suppliers.js";

const env = process.env.NODE_ENV || "development";
const config = allConfig[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

db["Users"] = User(sequelize, DataTypes);
db["Incomings"] = Incoming(sequelize, DataTypes);
db["Products"] = Products(sequelize, DataTypes);
db["Suppliers"] = Suppliers(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
