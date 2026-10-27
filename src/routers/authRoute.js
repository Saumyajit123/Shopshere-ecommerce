const express = require("express");

const AuthController = require("../controllers/authController");

const AuthMiddleware = require("../middleware/authMiddleware");

const Validation = require("../validation/validate");

const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require("../validation/authValidation");

const router = express.Router();



router.post("/register", Validation.validate(registerSchema), AuthController.register);


router.post("/login", Validation.validate(loginSchema), AuthController.login);


router.post(
  "/refresh-token",
  Validation.validate(refreshTokenSchema),
  AuthController.refreshToken,
);


router.post("/logout", AuthMiddleware.authMiddleware, AuthController.logout);


router.get(
  "/profile",
  AuthMiddleware.authMiddleware,
  AuthController.getProfile,
);

module.exports = router;
