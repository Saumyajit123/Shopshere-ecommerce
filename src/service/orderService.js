const crypto = require("crypto");
const sequelize = require("../config/dbConnect");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Cart = require("../models/cart");
const CartItem = require("../models/cartItem");
const Address = require("../models/address");
const { money } = require("./cartService");
const { getPagination, buildPagination } = require("../utils/pagination");

async function checkoutService(userId, addressId) {
  return sequelize.transaction(async (transaction) => {
    const cart = await Cart.findOne({
      where: { userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!cart) throw new Error("Your cart is empty");
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
      order: [["id", "ASC"]],
    });
    if (!cartItems.length) throw new Error("Your cart is empty");
    const address = await Address.findOne({
      where: { id: addressId, userId },
      transaction,
    });
    if (!address) throw new Error("Please select a valid shipping address");
    const addressSnapshot = {
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };
    const prepared = [];
    let totalAmount = 0;
    for (const cartItem of cartItems) {
      const product = await Product.findOne({
        where: { id: cartItem.productId, isActive: true },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product)
        throw new Error(`Product ${cartItem.productId} is unavailable`);
      let variant = null;
      if (cartItem.variantId) {
        variant = await ProductVariant.findOne({
          where: {
            id: cartItem.variantId,
            productId: product.id,
            isActive: true,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!variant)
          throw new Error(`${product.name}: selected variant is unavailable`);
      }
      const stock = variant ? Number(variant.stock) : Number(product.stock);
      if (stock < cartItem.quantity)
        throw new Error(`${product.name}: only ${stock} item(s) left in stock`);
      const unitPrice = money(
        variant && variant.price !== null ? variant.price : product.price,
      );
      const subtotal = money(unitPrice * cartItem.quantity);
      totalAmount = money(totalAmount + subtotal);
      prepared.push({ cartItem, product, variant, unitPrice, subtotal });
    }
    const shippingAmount = totalAmount >= 1500 ? 0 : 99;
    const discountAmount = 0;
    const finalAmount = money(totalAmount + shippingAmount - discountAmount);
    const order = await Order.create(
      {
        userId,
        orderNumber: `ORD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        totalAmount,
        shippingAmount,
        discountAmount,
        finalAmount,
        paymentStatus: "pending",
        status: "pending",
        shippingAddress: addressSnapshot,
      },
      { transaction },
    );
    for (const row of prepared) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: row.product.id,
          variantId: row.variant ? row.variant.id : null,
          productName: row.product.name,
          sku: row.variant ? row.variant.sku : null,
          quantity: row.cartItem.quantity,
          unitPrice: row.unitPrice,
          subtotal: row.subtotal,
          price: row.unitPrice,
        },
        { transaction },
      );
      if (row.variant)
        await row.variant.update(
          { stock: Number(row.variant.stock) - row.cartItem.quantity },
          { transaction },
        );
      else
        await row.product.update(
          { stock: Number(row.product.stock) - row.cartItem.quantity },
          { transaction },
        );
    }
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });
    return order;
  });
}

async function createOrderService(userId, items) {
  if (!Array.isArray(items) || !items.length)
    throw new Error("Order items are required");
  const transaction = await sequelize.transaction();
  try {
    const prepared = [];
    let totalAmount = 0;
    for (const item of items) {
      const productId = item.productId || item.product || item.id;
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        throw new Error("Quantity must be a positive integer");
      const product = await Product.findOne({
        where: { id: productId, isActive: true },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product)
        throw new Error(`Product ${productId} not found or inactive`);
      if (Number(product.stock) < quantity)
        throw new Error(`Insufficient stock for ${product.name}`);
      const price = money(product.price),
        subtotal = money(price * quantity);
      totalAmount = money(totalAmount + subtotal);
      prepared.push({ product, quantity, price, subtotal });
    }
    const order = await Order.create(
      {
        userId,
        orderNumber: `ORD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        totalAmount,
        shippingAmount: 0,
        discountAmount: 0,
        finalAmount: totalAmount,
        shippingAddress: {},
      },
      { transaction },
    );
    for (const row of prepared) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: row.product.id,
          productName: row.product.name,
          sku: null,
          quantity: row.quantity,
          unitPrice: row.price,
          subtotal: row.subtotal,
          price: row.price,
        },
        { transaction },
      );
      await row.product.update(
        { stock: Number(row.product.stock) - row.quantity },
        { transaction },
      );
    }
    await transaction.commit();
    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getUserOrdersService(userId) {
  return Order.findAll({ where: { userId }, order: [["createdAt", "DESC"]] });
}

async function getOrderByIdService(orderId, userId) {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: [
      {
        model: OrderItem,
        include: [{ model: Product, attributes: ["id", "name", "category"] }],
      },
    ],
  });
  if (!order) throw new Error("Order not found");
  return order;
}

async function getUserOrdersPaginatedService(userId, query = {}) {
  const { page, limit, offset } = getPagination(query, 10);

  const { rows, count } = await Order.findAndCountAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    orders: rows,
    pagination: buildPagination(count, page, limit),
  };
}

module.exports = {
  checkoutService,
  createOrderService,
  getUserOrdersService,
  getOrderByIdService,
  getUserOrdersPaginatedService,
};
