const authService = require("../../service/authService");
const productService = require("../../service/productService");
const orderService = require("../../service/orderService");
const analyticsService = require("../../service/analyticsService");
const cartService = require("../../service/cartService");
const wishlistService = require("../../service/wishlistService");
const addressService = require("../../service/addressService");
const { getPagination, buildPagination } = require("../../utils/pagination");

class EjsController {
  static page = async (req, res, next) => {
    try {
      const action = req.query.action || "landing";

      const currentUser = req.ejsUser || null;

      const message = req.query.message || null;
      const error = req.query.error || null;

      if (action === "landing") {
        return res.render("landing", {
          currentUser,
          message,
          error,
        });
      }

      if (action === "dashboard") {
        const orders = await orderService.getUserOrdersService(currentUser.id);

        return res.render("customer/dashboard", {
          currentUser,
          orders,
          message,
          error,
        });
      }

      if (action === "admin-dashboard") {
        const dashboard = await analyticsService.getDashboardService();

        const categorySales = await analyticsService.getCategorySalesService();

        const topProducts = await analyticsService.getTopProductService();

        return res.render("admin/dashboard", {
          currentUser,
          dashboard,
          categorySales,
          topProducts,
          message,
          error,
        });
      }

      if (action === "products") {
        const result = await productService.getAllProductService(req.query);

        return res.render("customer/products", {
          currentUser,
          products: result.productdata,
          pagination: result,
          query: req.query,
          message,
          error,
        });
      }

      if (action === "product-details") {
        const product = await productService.getProductByIdService(
          req.query.id,
        );

        return res.render("customer/product-details", {
          currentUser,
          product,
          message,
          error,
        });
      }

      if (action === "cart") {
        const cart = await cartService.getCart(currentUser.id);
        return res.render("customer/cart", {
          currentUser,
          cart,
          message,
          error,
        });
      }

      if (action === "wishlist") {
        const items = await wishlistService.list(currentUser.id);
        return res.render("customer/wishlist", {
          currentUser,
          items,
          message,
          error,
        });
      }

      if (action === "addresses") {
        const addresses = await addressService.list(currentUser.id);
        const cart = await cartService.getCart(currentUser.id);
        return res.render("customer/addresses", {
          currentUser,
          addresses,
          cart,
          message,
          error,
        });
      }

      if (action === "orders") {
        const orders = await orderService.getUserOrdersService(currentUser.id);

        return res.render("customer/orders", {
          currentUser,
          orders,
          message,
          error,
        });
      }

      if (action === "order-details") {
        const order = await orderService.getOrderByIdService(
          req.query.id,
          currentUser.id,
        );

        return res.render("customer/order-details", {
          currentUser,
          order,
          message,
          error,
        });
      }

      if (action === "admin-products") {
        const result = await productService.getAllProductService({
          page: 1,
          limit: 100,
        });

        return res.render("admin/products", {
          currentUser,
          products: result.productdata,
          product: null,
          pagination: result,
          query: req.query,
          mode: "create",
          message,
          error,
        });
      }

      if (action === "create-product-page") {
        const result = await productService.getAllProductService({
          page: 1,
          limit: 100,
        });

        return res.render("admin/products", {
          currentUser,
          products: result.productdata,
          product: null,
          pagination: result,
          query: req.query,
          mode: "create",
          message,
          error,
        });
      }

      if (action === "update-product-page") {
        const product = await productService.getProductByIdService(
          req.query.id,
        );

        const result = await productService.getProductByIdService(req.query.id);

        return res.render("admin/products", {
          currentUser,
          products: result.productdata,
          product,
          pagination: result,
          mode: "update",
          message,
          error,
        });
      }

      if (action === "forgot-password") {
        return res.render("auth/forgot-password", {
          currentUser,
          message,
          error,
        });
      }

      if (action === "reset-password") {
        return res.render("auth/reset-password", {
          currentUser,
          email: req.query.email || "",
          message,
          error,
        });
      }

      return res.status(404).render("landing", {
        currentUser,
        message: null,
        error: "Page not found",
      });
    } catch (error) {
      next(error);
    }
  };

  static action = async (req, res, next) => {
    try {
      const { action } = req.body || {};

      if (action === "register") {
        await authService.registerService({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });

        return res.redirect(
          "/ui?action=landing&message=Registration successful. Please login.",
        );
      }

      if (action === "login") {
        const result = await authService.loginService({
          email: req.body.email,
          password: req.body.password,
        });

        req.session.userId = result.user.id;

        req.session.role = result.user.role;

        return req.session.save((sessionError) => {
          if (sessionError) {
            return next(sessionError);
          }

          // Admin
          if (result.user.role === "admin") {
            return res.redirect("/ui?action=admin-dashboard");
          }

          // Customer
          return res.redirect("/ui?action=dashboard");
        });
      }

      if (action === "logout") {
        if (req.session.userId) {
          await authService.logoutService(req.session.userId);
        }

        req.session.destroy((sessionError) => {
          if (sessionError) {
            return next(sessionError);
          }

          return res.redirect(
            "/ui?action=landing&message=Logged out successfully",
          );
        });

        return;
      }

      if (action === "forgot-password") {
        await authService.forgotPasswordService(req.body.email);

        return res.redirect(
          `/ui?action=reset-password&email=${encodeURIComponent(
            req.body.email,
          )}&message=OTP sent to your email`,
        );
      }

      if (action === "reset-password") {
        await authService.resetPasswordService({
          email: req.body.email,
          otp: req.body.otp,
          password: req.body.password,
        });

        return res.redirect(
          "/ui?action=landing&message=Password reset successfully. Please login.",
        );
      }

      if (action === "create-product") {
        await productService.createProductService({
          name: req.body.name,
          category: req.body.category,
          price: req.body.price,
          stock: req.body.stock,
          imageBuffer: req.file ? req.file.buffer : null,
        });

        return res.redirect(
          "/ui?action=admin-products&message=Product created successfully",
        );
      }

      if (action === "update-product") {
        await productService.updateProductService(req.body.id, {
          name: req.body.name,
          category: req.body.category,
          price: req.body.price,
          stock: req.body.stock,
          imageBuffer: req.file ? req.file.buffer : null,
        });

        return res.redirect(
          "/ui?action=admin-products&message=Product updated successfully",
        );
      }

      if (action === "delete-product") {
        await productService.deleteProductService(req.body.id);

        return res.redirect(
          "/ui?action=admin-products&message=Product deleted successfully",
        );
      }

      if (action === "add-cart-item") {
        await cartService.addItem(req.ejsUser.id, {
          productId: Number(req.body.productId),
          variantId: req.body.variantId ? Number(req.body.variantId) : null,
          quantity: Number(req.body.quantity || 1),
        });
        return res.redirect("/ui?action=cart&message=Added to cart");
      }

      if (action === "update-cart-item") {
        await cartService.updateItem(
          req.ejsUser.id,
          req.body.id,
          Number(req.body.quantity),
        );
        return res.redirect("/ui?action=cart&message=Cart updated");
      }

      if (action === "remove-cart-item") {
        await cartService.removeItem(req.ejsUser.id, req.body.id);
        return res.redirect("/ui?action=cart&message=Item removed");
      }

      if (action === "add-wishlist") {
        await wishlistService.add(req.ejsUser.id, Number(req.body.productId));
        return res.redirect("/ui?action=wishlist&message=Added to wishlist");
      }

      if (action === "remove-wishlist") {
        await wishlistService.remove(
          req.ejsUser.id,
          Number(req.body.productId),
        );
        return res.redirect(
          "/ui?action=wishlist&message=Removed from wishlist",
        );
      }

      if (action === "create-address") {
        await addressService.create(req.ejsUser.id, req.body);
        return res.redirect("/ui?action=addresses&message=Address saved");
      }

      if (action === "delete-address") {
        await addressService.remove(req.ejsUser.id, req.body.id);
        return res.redirect("/ui?action=addresses&message=Address deleted");
      }

      if (action === "checkout") {
        const order = await orderService.checkoutService(
          req.ejsUser.id,
          req.body.addressId,
        );
        return res.redirect(
          `/ui?action=order-details&id=${order.id}&message=Order placed successfully`,
        );
      }

      if (action === "create-order") {
        let items;

        try {
          items = JSON.parse(req.body.items);
        } catch (error) {
          return res.redirect("/ui?action=products&error=Invalid order data");
        }

        await orderService.createOrderService(req.ejsUser.id, items);

        return res.redirect(
          "/ui?action=orders&message=Order placed successfully",
        );
      }

      if (action === "orders") {
        const result = await orderService.getUserOrdersPaginatedService(
          currentUser.id,
          req.query,
        );

        return res.render("customer/orders", {
          currentUser,
          orders: result.orders,
          pagination: result.pagination,
          query: req.query,
          message,
          error,
        });
      }

      return res.redirect("/ui?action=landing&error=Invalid action");
    } catch (error) {
      next(error);
    }
  };
}

module.exports = EjsController;
