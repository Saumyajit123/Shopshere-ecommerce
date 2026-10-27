const sequelize = require("../config/dbConnect");
const { DataTypes } = require("sequelize");
const bcryptjs = require("bcryptjs");

const User = sequelize.define(
  "user",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },

    refreshTokenHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    secretKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    resetOtpHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    resetOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,

    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcryptjs.hash(user.password, 12);
        }
      },

      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcryptjs.hash(user.password, 12);
        }
      },
    },
  },
);

// Compare password
User.prototype.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

module.exports = User;
