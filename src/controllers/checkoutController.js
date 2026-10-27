const orderService = require("../service/orderService");
class CheckoutController {
  static checkout = async (req, res) => {
    try {
      const addressId = req.body.addressId;
      if (!addressId) return res.status(400).json({ success: false, message: "addressId is required" });
      const order = await orderService.checkoutService(req.user.id, addressId);
      return res.status(201).json({ success: true, message: "Order placed successfully", data: order });
    } catch (e) {
      const status = /empty|address|stock|unavailable/i.test(e.message) ? 400 : 500;
      return res.status(status).json({ success: false, message: e.message });
    }
  };
}
module.exports = CheckoutController;
