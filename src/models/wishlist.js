const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");
const Wishlist = sequelize.define("wishlist", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "wishlists", timestamps: true, indexes: [{ unique: true, name: "wishlist_user_product_unique", fields: ["userId", "productId"] }] });
module.exports = Wishlist;
