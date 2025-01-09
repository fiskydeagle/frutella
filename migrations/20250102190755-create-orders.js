"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      productId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "processing",
      },
      orderQty: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      qty: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      price: {
        allowNull: true,
        type: Sequelize.DOUBLE(10, 2),
      },
      salePrice: {
        allowNull: true,
        type: Sequelize.DOUBLE(10, 2),
      },
      comment: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "",
      },
      date: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      createdBy: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      updatedBy: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Orders");
  },
};
