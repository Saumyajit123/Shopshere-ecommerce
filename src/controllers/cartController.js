const service = require("../service/cartService");
class CartController {
  static get = async (req, res) => { try { return res.json({ success: true, data: await service.getCart(req.user.id) }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
  static add = async (req, res) => { try { const data = await service.addItem(req.user.id, req.body); return res.status(201).json({ success: true, message: "Cart item added or quantity updated", data }); } catch (e) { return res.status(/not found|inactive|stock|Quantity|variant/i.test(e.message) ? 400 : 500).json({ success: false, message: e.message }); } };
  static update = async (req, res) => { try { const data = await service.updateItem(req.user.id, req.params.id, req.body.quantity); return res.json({ success: true, message: "Cart item updated", data }); } catch (e) { return res.status(/not found|inactive|stock|Quantity|variant/i.test(e.message) ? 400 : 500).json({ success: false, message: e.message }); } };
  static remove = async (req, res) => { try { await service.removeItem(req.user.id, req.params.id); return res.json({ success: true, message: "Cart item removed" }); } catch (e) { return res.status(404).json({ success: false, message: e.message }); } };
  static clear = async (req, res) => { try { await service.clearCart(req.user.id); return res.json({ success: true, message: "Cart cleared" }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
}
module.exports = CartController;
