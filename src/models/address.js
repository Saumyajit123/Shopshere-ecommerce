const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");
const Address = sequelize.define("address", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(120), allowNull: false },
  phone: { type: DataTypes.STRING(25), allowNull: false },
  addressLine1: { type: DataTypes.STRING(255), allowNull: false },
  addressLine2: { type: DataTypes.STRING(255), allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: false },
  state: { type: DataTypes.STRING(100), allowNull: false },
  postalCode: { type: DataTypes.STRING(20), allowNull: false },
  country: { type: DataTypes.STRING(100), allowNull: false, defaultValue: "India" },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: "addresses", timestamps: true, indexes: [{ fields: ["userId", "isDefault"] }] });
module.exports = Address;
