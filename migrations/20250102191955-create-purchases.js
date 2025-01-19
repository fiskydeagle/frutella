"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Purchases", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      qty: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      price: {
        allowNull: true,
        type: Sequelize.DOUBLE(10, 2),
      },
      supplierId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Suppliers",
          key: "id",
        },
        onUpdate: "NO ACTION", // Do nothing on update
        onDelete: "SET NULL",
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
    await queryInterface.dropTable("Purchases");
  },
};
