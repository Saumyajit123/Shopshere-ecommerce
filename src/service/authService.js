const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const mailService = require("./mailService");

const {
  generateSecretKey,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");

// Register:
const registerService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "user",
    isActive: true,
  });

  return user;
};

// Login:
const loginService = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // console.log("Email:", email);
  // console.log("Password received:", password);
  // console.log("Password hash:", user.password);

  const isPasswordValid = await user.comparePassword(password);

  // console.log("Password valid:", isPasswordValid);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const secretKey = generateSecretKey();

  await user.update({
    secretKey,
  });

  const accessToken = generateAccessToken(user, secretKey);

  const refreshToken = generateRefreshToken(user, secretKey);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await user.update({
    refreshTokenHash,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// Refresh token:
const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new error("Refresh token is required");
  }

  const decoded = jwt.decode(refreshToken);

  if (!decoded || !decoded.id) {
    throw new Error("Invalid refresh token");
  }

  const user = await User.findByPk(decoded.id);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.secretKey) {
    throw new Error("Session secret not found");
  }

  let verifiedToken;

  try {
    verifiedToken = jwt.verify(refreshToken, user.secretKey);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }

  if (verifiedToken.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  if (!user.refreshTokenHash) {
    throw new Error("Refresh token is invalid");
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

  if (!isValid) {
    throw new Error("Refresh token is invalid");
  }

  const newSecretKey = generateSecretKey();

  await user.update({
    secretKey: newSecretKey,
  });

  const newAccessToken = generateAccessToken(user, newSecretKey);

  const newRefreshToken = generateRefreshToken(user, newSecretKey);

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 12);

  await user.update({
    refreshTokenHash: newRefreshTokenHash,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Logout:
const logoutService = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newSecretKey = generateSecretKey();

  await user.update({
    secretKey: newSecretKey,
    refreshTokenHash: null,
  });

  return true;
};

// Get profile:
const getProfileService = async (userId) => {
  const user = User.findByPk(userId, {
    attributes: {
      exclude: ["password", "secretKey", "refreshTokenHash"],
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Forgot password:
const forgotPasswordService = async (email) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await user.update({
    resetOtpHash: otpHash,
    resetOtpExpiresAt: expiry,
  });

  await mailService.sendResetOtp(email, otp);

  return true;
};

// Reset password:
const resetPasswordService = async ({ email, otp, password }) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.resetOtpHash || !user.resetOtpExpiresAt) {
    throw new Error("OTP not found");
  }

  if (new Date() > new Date(user.resetOtpExpiresAt)) {
    throw new Error("OTP has expired");
  }

  const validOtp = await bcrypt.compare(otp, user.resetOtpHash);

  if (!validOtp) {
    throw new Error("Invalid OTP");
  }

  await user.update({
    password,
    resetOtpHash: null,
    resetOtpExpiresAt: null,
    secretKey: null,
    refreshTokenHash: null,
  });

  await mailService.sendPasswordResetSuccess(email);

  return true;
};

module.exports = {
  registerService,
  loginService,
  refreshAccessTokenService,
  logoutService,
  getProfileService,
  forgotPasswordService,
  resetPasswordService,
};
