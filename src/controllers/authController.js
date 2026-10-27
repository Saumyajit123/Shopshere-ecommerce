const authService = require("../service/authService");

class AuthController {
  // Register:
  static register = async (req, res, next) => {
    try {
      const user = await authService.registerService(req.body);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // Login:
  static login = async (req, res, next) => {
    try {
      const result = await authService.loginService(req.body);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Refresh token:
  static refreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshAccessTokenService(refreshToken);

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout:
  static logout = async (req, res, next) => {
    try {
      await authService.logoutService(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  };


  // Get profile:
  static getProfile = async (req, res, next) => {
    try {
      const user = await authService.getProfileService(req.user.id);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthController;
