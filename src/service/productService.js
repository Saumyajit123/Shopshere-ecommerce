const { Op } = require("sequelize");

const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
const uploadImage = require("../utils/cloudinaryUpload");
const deleteImage = require("../utils/cloudinaryDelete");

// =====================================================
// NORMALIZE IMAGE
// =====================================================

const normalizeImage = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image === "object") {
    return image;
  }

  if (typeof image === "string") {
    try {
      return JSON.parse(image);
    } catch (error) {
      console.error("Unable to parse product image:", image);
      return null;
    }
  }

  return null;
};

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProductService = async ({
  name,
  category,
  price,
  imageBuffer,
  stock,
}) => {
  const existingProduct = await Product.findOne({
    where: {
      name,
      isActive: true,
    },
  });

  if (existingProduct) {
    throw new Error("Product already exists");
  }

  let image = null;

  if (imageBuffer) {
    image = await uploadImage(imageBuffer, "ecommerce/products");

    console.log("========== CLOUDINARY IMAGE ==========");
    console.log(image);
    console.log("======================================");
  }

  const product = await Product.create({
    name,
    category,
    price,
    stock,
    image,
    isActive: true,
  });

  return product;
};

// =====================================================
// GET ALL PRODUCTS
// =====================================================

const getAllProductService = async (queryParams) => {
  const { name, category, minprice, maxprice } = queryParams;

  const currentPage = Number(queryParams.page) || 1;

  const pageLimit = Number(queryParams.limit) || 5;

  const skip = (currentPage - 1) * pageLimit;

  const query = {
    isActive: true,
  };

  // Search by product name
  if (name) {
    query.name = {
      [Op.like]: `%${name}%`,
    };
  }

  // Category filter
  if (category) {
    query.category = {
      [Op.like]: `%${category}%`,
    };
  }

  // Price filter
  if (minprice || maxprice) {
    query.price = {};

    if (minprice) {
      query.price[Op.gte] = Number(minprice);
    }

    if (maxprice) {
      query.price[Op.lte] = Number(maxprice);
    }
  }

  const { rows: productdata, count: totalproduct } =
    await Product.findAndCountAll({
      where: query,
      order: [["createdAt", "DESC"]],
      limit: pageLimit,
      offset: skip,
    });

  // Normalize image before sending to EJS
  productdata.forEach((product) => {
    product.setDataValue("image", normalizeImage(product.image));
  });

  return {
    productdata,
    totalproduct,
    currentpage: currentPage,
    totalpage: Math.ceil(totalproduct / pageLimit),
  };
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================

const getProductByIdService = async (productId) => {
  const product = await Product.findOne({
    where: {
      id: productId,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  product.setDataValue("image", normalizeImage(product.image));
  const variants = await ProductVariant.findAll({
    where: { productId: product.id, isActive: true },
    order: [["createdAt", "ASC"]],
  });
  product.setDataValue("variants", variants);

  return product;
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProductService = async (
  id,
  { name, category, imageBuffer, price, stock },
) => {
  const product = await Product.findOne({
    where: {
      id,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // -----------------------------------------------
  // Check duplicate product name
  // -----------------------------------------------

  if (name && name !== product.name) {
    const existingProduct = await Product.findOne({
      where: {
        name,

        isActive: true,

        id: {
          [Op.ne]: id,
        },
      },
    });

    if (existingProduct) {
      throw new Error("Another product with this name already exists");
    }
  }

  // -----------------------------------------------
  // Existing image
  // -----------------------------------------------

  let oldImage = normalizeImage(product.image);

  let newImage = oldImage;

  // -----------------------------------------------
  // New image uploaded
  // -----------------------------------------------

  if (imageBuffer) {
    console.log("New product image received");

    newImage = await uploadImage(imageBuffer, "ecommerce/products");

    console.log("New Cloudinary image:", newImage);

    // Delete old Cloudinary image
    if (oldImage && oldImage.public_id) {
      try {
        await deleteImage(oldImage.public_id);

        console.log("Old Cloudinary image deleted:", oldImage.public_id);
      } catch (error) {
        console.error("Failed to delete old Cloudinary image:", error.message);
      }
    }
  }

  // -----------------------------------------------
  // Update database
  // -----------------------------------------------

  await product.update({
    name: name ?? product.name,

    category: category ?? product.category,

    price: price ?? product.price,

    stock: stock ?? product.stock,

    image: newImage,
  });

  // Make sure EJS receives object
  product.setDataValue("image", normalizeImage(product.image));

  console.log("Updated product image:", product.image);

  return product;
};

// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProductService = async (id) => {
  const product = await Product.findOne({
    where: {
      id,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const image = normalizeImage(product.image);

  // Delete Cloudinary image
  if (image && image.public_id) {
    await deleteImage(image.public_id);
  }

  // Soft delete
  await product.update({
    image: null,
    isActive: false,
  });

  return product;
};

module.exports = {
  createProductService,
  getAllProductService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
};
