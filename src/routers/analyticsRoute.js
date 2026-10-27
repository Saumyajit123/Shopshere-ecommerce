const express = require("express");
const router = express.Router();

const AnalyticsController = require("../controllers/analyticsController");
const AuthMiddleware = require("../middleware/authMiddleware");
const RoleMiddleware = require("../middleware/roleMiddleware");


router.get(
  "/analytics/dashboard",
  AuthMiddleware.authMiddleware,
  RoleMiddleware("admin"),
  AnalyticsController.dashboard,
);

router.get(
  "/analytics/category-sales",
  AuthMiddleware.authMiddleware,
  RoleMiddleware("admin"),
  AnalyticsController.categorySales,
);

router.get(
  "/analytics/top-products",
  AuthMiddleware.authMiddleware,
  RoleMiddleware("admin"),
  AnalyticsController.topProducts,
);

router.get(
  "/analytics/customers",
  AuthMiddleware.authMiddleware,
  RoleMiddleware("admin"),
  AnalyticsController.customerAnalytics,
);

router.get(
  "/analytics/monthly-revenue",
  AuthMiddleware.authMiddleware,
  RoleMiddleware("admin"),
  AnalyticsController.monthlyRevenue,
);

router.get(
  "/analytics/sales",
  AuthMiddleware.authMiddleware,
  RoleMiddleware("admin"),
  AnalyticsController.salesByDate,
);

router.get(
  "/analytics/order-status",
  AuthMiddleware.authMiddleware,
  RoleMiddleware("admin"),
  AnalyticsController.orderStatus,
);

module.exports = router;
