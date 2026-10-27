const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");
const OrderItem = sequelize.define("orderItem", {
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  variantId: { type: DataTypes.INTEGER, allowNull: true },
  productName: { type: DataTypes.STRING(180), allowNull: true },
  sku: { type: DataTypes.STRING(100), allowNull: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: "order_items", timestamps: true, indexes: [{ fields: ["orderId"] }, { fields: ["productId"] }] });
module.exports = OrderItem;
