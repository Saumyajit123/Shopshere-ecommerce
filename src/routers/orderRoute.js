const express = require("express");
const router = express.Router();

const OrderController = require("../controllers/orderController");

const AuthMiddleware = require("../middleware/authMiddleware");

const Validation = require("../validation/validate");

const { createOrderSchema } = require("../validation/orderValidation");


router.post(
  "/order/create",
  AuthMiddleware.authMiddleware,
  Validation.validate(createOrderSchema),
  OrderController.createOrder,
);

router.get(
  "/order/all",
  AuthMiddleware.authMiddleware,
  OrderController.getUserOrders,
);

module.exports = router;
