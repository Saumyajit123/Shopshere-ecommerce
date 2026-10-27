const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware");
const Controller = require("../controllers/checkoutController");
router.post("/checkout", AuthMiddleware.authMiddleware, Controller.checkout);
module.exports = router;
