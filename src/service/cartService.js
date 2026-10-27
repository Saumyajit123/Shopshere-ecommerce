const sequelize = require("../config/dbConnect");
const Cart = require("../models/cart");
const CartItem = require("../models/cartItem");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");

const money = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
async function getOrCreateCart(userId, transaction) {
  let cart = await Cart.findOne({ where: { userId }, transaction, lock: transaction ? transaction.LOCK.UPDATE : undefined });
  if (!cart) cart = await Cart.create({ userId }, { transaction });
  return cart;
}
async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  const items = await CartItem.findAll({
    where: { cartId: cart.id }, order: [["createdAt", "ASC"]],
    include: [
      { model: Product, attributes: ["id", "name", "image", "price", "stock", "isActive"] },
      { model: ProductVariant, attributes: ["id", "name", "color", "size", "sku", "price", "stock", "isActive"], required: false },
    ],
  });
  const normalized = items.map((item) => {
    const row = item.toJSON();
    row.subtotal = money(Number(row.price) * row.quantity);
    return row;
  });
  return { id: cart.id, items: normalized, itemCount: normalized.reduce((sum, i) => sum + i.quantity, 0), subtotal: money(normalized.reduce((sum, i) => sum + i.subtotal, 0)), total: money(normalized.reduce((sum, i) => sum + i.subtotal, 0)) };
}
async function addItem(userId, { productId, variantId = null, quantity }) {
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) throw new Error("Quantity must be a positive integer");
  return sequelize.transaction(async (transaction) => {
    const product = await Product.findOne({ where: { id: productId, isActive: true }, transaction, lock: transaction.LOCK.UPDATE });
    if (!product) throw new Error("Product not found or inactive");
    let variant = null;
    if (variantId !== null && variantId !== undefined && variantId !== "") {
      variant = await ProductVariant.findOne({ where: { id: variantId, productId: product.id, isActive: true }, transaction, lock: transaction.LOCK.UPDATE });
      if (!variant) throw new Error("Variant not found, inactive, or does not belong to this product");
    }
    const stock = variant ? Number(variant.stock) : Number(product.stock);
    const price = money(variant && variant.price !== null ? variant.price : product.price);
    const cart = await getOrCreateCart(userId, transaction);
    const where = { cartId: cart.id, productId: product.id, variantId: variant ? variant.id : null };
    let item = await CartItem.findOne({ where, transaction, lock: transaction.LOCK.UPDATE });
    const nextQuantity = (item ? Number(item.quantity) : 0) + Number(quantity);
    if (nextQuantity > stock) throw new Error(`Only ${stock} item(s) available in stock`);
    if (item) await item.update({ quantity: nextQuantity, price }, { transaction });
    else item = await CartItem.create({ ...where, quantity: Number(quantity), price }, { transaction });
    return { id: item.id, productId: item.productId, variantId: item.variantId, quantity: item.quantity, price: item.price, subtotal: money(Number(item.price) * item.quantity) };
  });
}
async function updateItem(userId, itemId, quantity) {
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) throw new Error("Quantity must be a positive integer");
  return sequelize.transaction(async (transaction) => {
    const cart = await Cart.findOne({ where: { userId }, transaction });
    if (!cart) throw new Error("Cart item not found");
    const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!item) throw new Error("Cart item not found");
    const product = await Product.findOne({ where: { id: item.productId, isActive: true }, transaction, lock: transaction.LOCK.UPDATE });
    if (!product) throw new Error("Product not found or inactive");
    const variant = item.variantId ? await ProductVariant.findOne({ where: { id: item.variantId, productId: product.id, isActive: true }, transaction, lock: transaction.LOCK.UPDATE }) : null;
    if (item.variantId && !variant) throw new Error("Variant not found or inactive");
    const stock = variant ? Number(variant.stock) : Number(product.stock);
    if (Number(quantity) > stock) throw new Error(`Only ${stock} item(s) available in stock`);
    const price = money(variant && variant.price !== null ? variant.price : product.price);
    await item.update({ quantity: Number(quantity), price }, { transaction });
    return { id: item.id, quantity: item.quantity, price: item.price, subtotal: money(Number(item.price) * item.quantity) };
  });
}
async function removeItem(userId, itemId) {
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) throw new Error("Cart item not found");
  const deleted = await CartItem.destroy({ where: { id: itemId, cartId: cart.id } });
  if (!deleted) throw new Error("Cart item not found");
  return true;
}
async function clearCart(userId, transaction) {
  const cart = await getOrCreateCart(userId, transaction);
  await CartItem.destroy({ where: { cartId: cart.id }, transaction });
  return cart;
}
module.exports = { getCart, addItem, updateItem, removeItem, clearCart, getOrCreateCart, money };
