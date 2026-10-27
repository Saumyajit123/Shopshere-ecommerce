const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");
const Order = sequelize.define("order", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  orderNumber: { type: DataTypes.STRING(40), allowNull: true, unique: true },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  shippingAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  discountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  finalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  paymentStatus: { type: DataTypes.ENUM("pending", "paid", "failed", "refunded"), allowNull: false, defaultValue: "pending" },
  status: { type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"), allowNull: false, defaultValue: "pending" },
  shippingAddress: { type: DataTypes.JSON, allowNull: true },
}, { tableName: "orders", timestamps: true, indexes: [{ fields: ["userId", "createdAt"] }, { fields: ["status", "createdAt"] }] });
module.exports = Order;
