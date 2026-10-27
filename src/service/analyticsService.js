const { Op } = require("sequelize");

const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");

// Dashboard:
const getDashboardService = async () => {
  const totalOrders = await Order.count();

  const validOrders = await Order.findAll({
    where: {
      status: {
        [Op.ne]: "cancelled",
      },
    },
    attributes: ["totalAmount"],
  });

  // Revenue:
  const revenue = validOrders.reduce((total, order) => {
    return total + Number(order.totalAmount);
  }, 0);

  // Average order value:
  const averageOrderValue =
    validOrders.length > 0 ? revenue / validOrders.length : 0;

  const cancelledOrders = await Order.count({
    where: {
      status: "cancelled",
    },
  });

  return {
    totalOrders,
    revenue,
    averageOrderValue,
    cancelledOrders,
  };
};

// Category sales:
const getCategorySalesService = async () => {
  const orders = await Order.findAll({
    where: {
      status: {
        [Op.ne]: "cancelled",
      },
    },
    attributes: ["id"],
  });

  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return [];
  }

  const orderItems = await OrderItem.findAll({
    where: {
      orderId: {
        [Op.in]: orderIds,
      },
    },
    attributes: ["orderId", "productId", "quantity", "price"],
  });

  if (orderItems.length === 0) {
    return [];
  }

  const productIds = [...new Set(orderItems.map((item) => item.productId))];

  const products = await Product.findAll({
    where: {
      id: {
        [Op.in]: productIds,
      },
    },
    attributes: ["id", "category"],
  });

  const productMap = new Map();

  products.forEach((product) => {
    productMap.set(product.id, product);
  });

  // Group by category:
  const categoryMap = new Map();

  orderItems.forEach((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      return;
    }

    const category = product.category;

    const quantity = Number(item.quantity);
    const price = Number(item.price);

    const revenue = quantity * price;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        quantitySold: 0,
        revenue: 0,
      });
    }

    const categorydata = categoryMap.get(category);

    categorydata.quantitySold += quantity;
    categorydata.revenue += revenue;
  });

  const result = Array.from(categoryMap.values());

  result.sort((a, b) => {
    return b.revenue - a.revenue;
  });

  return result;
};

// Top products:
const getTopProductService = async () => {
  const orders = await Order.findAll({
    where: {
      status: {
        [Op.ne]: "cancelled",
      },
    },
    attributes: ["id"],
  });

  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return [];
  }

  const orderItems = await OrderItem.findAll({
    where: {
      orderId: {
        [Op.in]: orderIds,
      },
    },
    attributes: ["productId", "quantity", "price"],
  });

  if (orderItems.length === 0) {
    return [];
  }

  const productIds = [...new Set(orderItems.map((item) => item.productId))];

  const products = await Product.findAll({
    where: {
      id: {
        [Op.in]: productIds,
      },
    },
    attributes: ["id", "name"],
  });

  const productMap = new Map();

  products.forEach((product) => {
    productMap.set(product.id, product);
  });

  const productMapData = new Map();

  orderItems.forEach((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      return;
    }

    const quantity = Number(item.quantity);
    const price = Number(item.price);

    const revenue = quantity * price;

    if (!productMapData.has(item.productId)) {
      productMapData.set(item.productId, {
        id: product.id,
        name: product.name,
        quantitySold: 0,
        revenue: 0,
      });
    }

    const productData = productMapData.get(item.productId);

    productData.quantitySold += quantity;
    productData.revenue += revenue;
  });

  const result = Array.from(productMapData.values());

  result.sort((a, b) => {
    return b.revenue - a.revenue;
  });

  return result.slice(0, 5);
};

// Customer analytics:
const getCustomerAnalyticsService = async () => {
  const users = await User.findAll({
    attributes: ["id", "name", "email"],
  });

  const orders = await Order.findAll({
    where: {
      status: {
        [Op.ne]: "cancelled",
      },
    },
    attributes: ["id", "userId", "totalAmount"],
  });

  const customerMap = new Map();

  users.forEach((user) => {
    customerMap.set(user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      totalOrders: 0,
      totalSpending: 0,
    });
  });

  orders.forEach((order) => {
    const customer = customerMap.get(order.userId);

    if (!customer) {
      return;
    }

    customer.totalOrders += 1;

    customer.totalSpending += Number(order.totalAmount);
  });

  const result = Array.from(customerMap.values());

  // Highest spending first:
  result.sort((a, b) => {
    return b.totalSpending - a.totalSpending;
  });

  return result;
};

// Monthly revenue:
const getMonthlyRevenueService = async () => {
  const orders = await Order.findAll({
    where: {
      status: {
        [Op.ne]: "cancelled",
      },
    },
    attributes: ["totalAmount", "createdAt"],
  });

  const monthlyMap = new Map();

  orders.forEach((order) => {
    const date = new Date(order.createdAt);

    const year = date.getFullYear();

    const month = date.getMonth() + 1;

    const key = `${year} - ${month}`;

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        year,
        month,
        revenue: 0,
      });
    }

    const monthData = monthlyMap.get(key);

    monthData.revenue += Number(order.totalAmount);
  });

  const result = Array.from(monthlyMap.values());

  result.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    return a.month - b.month;
  });

  return result;
};

// Sales by date:
const getSalesService = async (from, to) => {
  const where = {
    status: {
      [Op.ne]: "cancelled",
    },
  };

  if (from && to) {
    where.createdAt = {
      [open.between]: [from, to],
    };
  } else if (from) {
    where.createdAt = {
      [Op.gte]: from,
    };
  } else if (to) {
    where.createdAt = {
      [Op.lte]: to,
    };
  }

  const orders = await Order.findAll({
    where,
    attributes: ["id", "totalAmount"],
  });

  const totalOrders = orders.length;

  const revenue = orders.reduce((total, order) => {
    return (total + Number(order.totalAmount), 0);
  });

  const averageOrdervalue = totalOrders > 0 ? revenue / totalOrders : 0;

  const orderIds = orders.map((order) => order.id);

  let totalItems = 0;

  if (orderIds.length > 0) {
    const orderItems = await OrderItem.findAll({
      where: {
        orderId: {
          [Op.in]: orderIds,
        },
      },
      attributes: ["quantity"],
    });

    totalItems = orderItems.reduce((total, item) => {
      return total + Number(item.quantity);
    }, 0);
  }

  return {
    totalOrders,
    revenue,
    averageOrdervalue,
    totalItems,
  };
};

// Order status:
const getOrderStatus = async () => {
  const orders = await Order.findAll({
    attributes: ["status", "totalAmount"],
  });

  const statusMap = new Map();

  orders.forEach((order) => {
    const status = order.status;

    if (!statusMap.has(status)) {
      statusMap.set(status, {
        status,
        orderCount: 0,
        revenue: 0,
      });
    }

    const statusData = statusMap.get(status);

    statusData.orderCount += 1;

    statusData.revenue += Number(order.totalAmount);
  });

  const result = Array.from(statusMap.values());

  // Highest order count first
  result.sort((a, b) => {
    return b.orderCount - a.orderCount;
  });

  return result;
};


module.exports = {
  getDashboardService,
  getCategorySalesService,
  getTopProductService,
  getCustomerAnalyticsService,
  getMonthlyRevenueService,
  getSalesService,
  getOrderStatus,
};
