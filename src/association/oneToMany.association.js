// Associations are registered centrally in src/models/index.js.
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
module.exports = { User, Product, Order, OrderItem };
