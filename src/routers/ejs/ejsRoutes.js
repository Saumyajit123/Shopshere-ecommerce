const express = require("express");

const EjsController = require("../../controllers/ejs/ejscontroller");
const EjsAuthMiddleware = require("../../middleware/ejs/authEJSMiddleware");
const upload = require("../../middleware/uploadMiddleware");

const router = express.Router();

router.all(
  "/",
  upload.single("image"),
  EjsAuthMiddleware.optionalAuth,
  EjsAuthMiddleware.requireAuth,
  EjsAuthMiddleware.checkRole,
  
  (req, res, next) => {
    if (req.method === "GET") {
      return EjsController.page(req, res, next);
    }
    if (req.method === "POST") {
      return EjsController.action(req, res, next);
    }

    return res.status(405).send("Method Not Allowed");
  },
);

module.exports = router;
