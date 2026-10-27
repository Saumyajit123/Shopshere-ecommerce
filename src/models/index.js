const sequelize = require("../config/dbConnect");
const User = require("./user");
const Product = require("./product");
const ProductVariant = require("./productVariant");
const Cart = require("./cart");
const CartItem = require("./cartItem");
const Wishlist = require("./wishlist");
const Address = require("./address");
const Order = require("./order");
const OrderItem = require("./orderItem");

User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
Cart.belongsTo(User, { foreignKey: "userId" });
Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });
Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });
ProductVariant.hasMany(CartItem, { foreignKey: "variantId" });
CartItem.belongsTo(ProductVariant, { foreignKey: "variantId" });
User.hasMany(Wishlist, { foreignKey: "userId", onDelete: "CASCADE" });
Wishlist.belongsTo(User, { foreignKey: "userId" });
Product.hasMany(Wishlist, { foreignKey: "productId", onDelete: "CASCADE" });
Wishlist.belongsTo(Product, { foreignKey: "productId" });
User.hasMany(Address, { foreignKey: "userId", onDelete: "CASCADE" });
Address.belongsTo(User, { foreignKey: "userId" });
Product.hasMany(ProductVariant, { foreignKey: "productId", onDelete: "CASCADE" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });
User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });
ProductVariant.hasMany(OrderItem, { foreignKey: "variantId" });
OrderItem.belongsTo(ProductVariant, { foreignKey: "variantId" });

sequelize.sync({ alter: true })
  .then(async () => {
    // Legacy rows get a stable order number and totals so the expanded schema remains compatible.
    await Order.update({ orderNumber: sequelize.literal("CONCAT('ORD-', id)") }, { where: { orderNumber: null } }).catch(() => {});
    await Order.update({ shippingAmount: 0, discountAmount: 0, finalAmount: sequelize.literal("totalAmount") }, { where: { finalAmount: 0 } }).catch(() => {});
    console.log("MySQL database synced");
  })
  .catch((err) => console.error("Error syncing db: ", err));

module.exports = { User, Product, ProductVariant, Cart, CartItem, Wishlist, Address, Order, OrderItem };
