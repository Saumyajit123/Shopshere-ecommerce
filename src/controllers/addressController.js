const service = require("../service/addressService");
class AddressController {
  static create = async (req, res) => { try { return res.status(201).json({ success: true, data: await service.create(req.user.id, req.body) }); } catch (e) { return res.status(400).json({ success: false, message: e.message }); } };
  static list = async (req, res) => { try { return res.json({ success: true, data: await service.list(req.user.id) }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
  static update = async (req, res) => { try { return res.json({ success: true, data: await service.update(req.user.id, req.params.id, req.body) }); } catch (e) { return res.status(400).json({ success: false, message: e.message }); } };
  static remove = async (req, res) => { try { await service.remove(req.user.id, req.params.id); return res.json({ success: true, message: "Address deleted" }); } catch (e) { return res.status(404).json({ success: false, message: e.message }); } };
}
module.exports = AddressController;
