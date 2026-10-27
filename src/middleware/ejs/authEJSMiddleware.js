const User = require("../../models/user");

class EjsAuthMiddleware {
  static optionalAuth = async (req, res, next) => {
    try {
      req.ejsUser = null;

      if (req.session.userId) {
        const user = await User.findByPk(req.session.userId);

        if (user && user.isActive) {
          req.ejsUser = user;
        } else {
          req.session.destroy(() => {});
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  static requireAuth = (req, res, next) => {
    const action = req.method === "GET" ? req.query.action : req.body?.action;

    const publicActions = [
      "landing",
      "products",
      "product-details",
      "login",
      "register",
      "forgot-password",
      "reset-password",
    ];

    if (publicActions.includes(action)) {
      return next();
    }

    if (!req.ejsUser) {
      return res.redirect("/ui?action=landing&error=Please login first");
    }

    next();
  };

  static adminOnly = (req, res, next) => {
    if (!req.ejsUser) {
      return res.redirect("/ui?action=landing&error=Please login first");
    }

    if (req.ejsUser.role !== "admin") {
      return res.redirect("/ui?action=landing&error=Admin access required");
    }

    next();
  };

  static customerOnly = (req, res, next) => {
    if (!req.ejsUser) {
      return res.redirect("/ui?action=landing&error=Please login first");
    }

    if (req.ejsUser.role !== "user" && req.ejsUser.role !== "customer") {
      return res.redirect("/ui?action=landing&error=Customer access required");
    }

    next();
  };

  static checkRole = (req, res, next) => {
    const action = req.method === "GET" ? req.query.action : req.body?.action;

    const adminActions = [
      "admin-dashboard",
      "admin-products",

      "create-product-page",
      "update-product-page",

      "create-product",
      "update-product",
      "delete-product",
    ];

    const customerActions = [
      "dashboard",
      "orders",
      "order-details",
      "create-order",
    ];

    if (adminActions.includes(action)) {
      return EjsAuthMiddleware.adminOnly(req, res, next);
    }

    if (customerActions.includes(action)) {
      return EjsAuthMiddleware.customerOnly(req, res, next);
    }

    next();
  };
}

module.exports = EjsAuthMiddleware;
