const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate a random secret key
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate Access Token
const generateAccessToken = (user, secretKey) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    secretKey,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || "1h",
    },
  );
};

// Generate Refresh Token
const generateRefreshToken = (user, secretKey) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    secretKey,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    },
  );
};

module.exports = {
  generateSecretKey,
  generateAccessToken,
  generateRefreshToken,
};
