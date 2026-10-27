const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware");
const Controller = require("../controllers/addressController");
router.post("/addresses", AuthMiddleware.authMiddleware, Controller.create);
router.get("/addresses", AuthMiddleware.authMiddleware, Controller.list);
router.put("/addresses/:id", AuthMiddleware.authMiddleware, Controller.update);
router.delete("/addresses/:id", AuthMiddleware.authMiddleware, Controller.remove);
module.exports = router;
