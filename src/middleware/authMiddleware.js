const jwt = require("jsonwebtoken");

const User = require("../models/user");

class AuthMiddleware {
  static authMiddleware = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Access token is required",
        });
      }

      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
          success: false,
          message: "Authorization format must be Bearer <token>",
        });
      }

      const token = parts[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access token is required",
        });
      }

      const decoded = jwt.decode(token);

      if (!decoded || !decoded.userId) {
        return res.status(401).json({
          success: false,
          message: "Invalid access token",
        });
      }

      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      const verifiedUser = jwt.verify(token, user.secretKey);

      req.user = user;

      req.tokenData = verifiedUser;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }
  };
}

module.exports = AuthMiddleware;
