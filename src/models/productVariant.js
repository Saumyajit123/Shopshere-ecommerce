const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");

const ProductVariant = sequelize.define("productVariant", {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  color: { type: DataTypes.STRING(60), allowNull: true },
  size: { type: DataTypes.STRING(40), allowNull: true },
  sku: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "product_variants", timestamps: true, indexes: [{ fields: ["productId", "isActive"] }] });

module.exports = ProductVariant;
