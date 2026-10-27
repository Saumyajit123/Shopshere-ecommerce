const express = require('express');
const router = express.Router();

const authRoute = require("../routers/authRoute");
router.use('/api', authRoute);

const productRoute = require("../routers/productRoute");
router.use('/api', productRoute);

const orderRoute = require("../routers/orderRoute");
router.use('/api', orderRoute);

const analyticsRoute = require("../routers/analyticsRoute");
router.use('/api', analyticsRoute);

const cartRoute = require("../routers/cartRoute");
router.use("/api/v1", cartRoute);
const wishlistRoute = require("../routers/wishlistRoute");
router.use("/api/v1", wishlistRoute);
const addressRoute = require("../routers/addressRoute");
router.use("/api/v1", addressRoute);
const checkoutRoute = require("../routers/checkoutRoute");
router.use("/api/v1", checkoutRoute);

const ejsRoute = require("../routers/ejs/ejsRoutes");
router.use('/ui', ejsRoute);

module.exports = router;