const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");
const CartItem = sequelize.define("cartItem", {
  cartId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  variantId: { type: DataTypes.INTEGER, allowNull: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: "cart_items", timestamps: true, indexes: [{ unique: true, name: "cart_product_variant_unique", fields: ["cartId", "productId", "variantId"] }] });
module.exports = CartItem;
