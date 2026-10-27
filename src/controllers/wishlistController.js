const service = require("../service/wishlistService");
class WishlistController {
  static add = async (req, res) => { try { const data = await service.add(req.user.id, req.body.productId); return res.status(201).json({ success: true, message: "Added to wishlist", data }); } catch (e) { return res.status(/already/i.test(e.message) ? 409 : /not found|inactive/i.test(e.message) ? 400 : 500).json({ success: false, message: e.message }); } };
  static list = async (req, res) => { try { return res.json({ success: true, data: await service.list(req.user.id) }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
  static remove = async (req, res) => { try { await service.remove(req.user.id, req.params.productId); return res.json({ success: true, message: "Removed from wishlist" }); } catch (e) { return res.status(404).json({ success: false, message: e.message }); } };
}
module.exports = WishlistController;
