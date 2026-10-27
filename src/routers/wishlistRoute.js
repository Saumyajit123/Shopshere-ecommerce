const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware");
const Controller = require("../controllers/wishlistController");
router.post("/wishlist", AuthMiddleware.authMiddleware, Controller.add);
router.get("/wishlist", AuthMiddleware.authMiddleware, Controller.list);
router.delete("/wishlist/:productId", AuthMiddleware.authMiddleware, Controller.remove);
module.exports = router;
