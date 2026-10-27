const productService = require("../service/productService");

class ProductController {
  // Create product:
  static createproduct = async (req, res) => {
    try {
      const product = await productService.createProductService({
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        stock: req.body.stock,
        imageBuffer: req.file ? req.file.buffer : null,
      });

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Get all products:
  static getAllProducts = async (req, res) => {
    try {
      const products = await productService.getAllProductService(req.query);

      return res.status(200).json({
        success: true,
        totalproduct: products.totalproduct,
        data: products.productdata,
        currentpage: products.currentpage,
        totalpage: products.totalpage,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Get product by Id:
  static getProductById = async (req, res) => {
    try {
      const product = await productService.getProductByIdService(req.params.id);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}

module.exports = ProductController;
