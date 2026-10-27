const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");
const Cart = sequelize.define("cart", { userId: { type: DataTypes.INTEGER, allowNull: false, unique: true } }, { tableName: "carts", timestamps: true });
module.exports = Cart;
