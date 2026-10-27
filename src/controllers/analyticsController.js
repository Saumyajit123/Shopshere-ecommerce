const AnalyticsService = require("../service/analyticsService");

class AnalyticsController {
  static async dashboard(req, res) {
    try {
      const dashboard = await AnalyticsService.getDashboardService();

      return res.status(200).json({
        success: true,
        message: "Dashboard fetched successfully",
        data: dashboard,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async categorySales(req, res) {
    try {
      const categorySales = await AnalyticsService.getCategorySalesService();

      return res.status(200).json({
        success: true,
        message: "Category sales fetched successfully",
        data: categorySales,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async topProducts(req, res) {
    try {
      const topProducts = await AnalyticsService.getTopProductService();

      return res.status(200).json({
        success: true,
        message: "Top products fetched successfully",
        data: topProducts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async customerAnalytics(req, res) {
    try {
      const customerAnalytics =
        await AnalyticsService.getCustomerAnalyticsService();

      return res.status(200).json({
        success: true,
        message: "Customer analytics fetched successfully",
        data: customerAnalytics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async monthlyRevenue(req, res) {
    try {
      const monthlyRevenue = await AnalyticsService.getMonthlyRevenueService();

      return res.status(200).json({
        success: true,
        message: "Monthly revenue fetched successfully",
        data: monthlyRevenue,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async salesByDate(req, res) {
    try {
      const { from, to } = req.query;

      const sales = await AnalyticsService.getSalesService(from, to);

      return res.status(200).json({
        success: true,
        message: "Sales analytics fetched successfully",
        data: sales,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async orderStatus(req, res) {
    try {
      const orderStatus = await AnalyticsService.getOrderStatus();

      return res.status(200).json({
        success: true,
        message: "Order status analytics fetched successfully",
        data: orderStatus,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AnalyticsController;
