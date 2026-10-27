const orderService = require("../service/orderService");

class OrderController {
  // Create order:
  static createOrder = async (req, res) => {
    try {
      const order = await orderService.createOrderService(
        req.user.id,
        req.body.items,
      );

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Get user orders:
  static getUserOrders = async (req, res) => {
    try {
      const orders = await orderService.getUserOrdersService(req.user.id);

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}

module.exports = OrderController;
