const Wishlist = require("../models/wishlist");
const Product = require("../models/product");
async function add(userId, productId) {
  const product = await Product.findOne({ where: { id: productId, isActive: true } });
  if (!product) throw new Error("Product not found or inactive");
  const [entry, created] = await Wishlist.findOrCreate({ where: { userId, productId: product.id }, defaults: { userId, productId: product.id } });
  if (!created) throw new Error("Product is already in your wishlist");
  return entry;
}
async function list(userId) {
  return Wishlist.findAll({ where: { userId }, include: [{ model: Product, where: { isActive: true }, required: true, attributes: ["id", "name", "category", "price", "image"] }], order: [["createdAt", "DESC"]] });
}
async function remove(userId, productId) {
  const count = await Wishlist.destroy({ where: { userId, productId } });
  if (!count) throw new Error("Wishlist item not found");
  return true;
}
module.exports = { add, list, remove };
