const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");

const Product = sequelize.define(
  "product",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    image: {
      type: DataTypes.JSON,
      allowNull: true,

      get() {
        const value = this.getDataValue("image");

        if (!value) {
          return null;
        }

        // If MySQL/Sequelize returns JSON as a string
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch (error) {
            console.error("Invalid product image JSON:", value);
            return null;
          }
        }

        return value;
      },
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },

  {
    tableName: "products",
    timestamps: true,
    indexes: [
      {
        fields: ["category", "price"],
      },
    ],
  },
);

module.exports = Product;
