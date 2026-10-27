require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");

const sequelize = require("./src/config/dbConnect");
require("./src/models/index");
const routerIndex = require("./src/routers/routerIndex");
require("./src/association/oneToMany.association");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);


// Static folder:
app.use(express.static(path.join(__dirname, "public")));

// Ejs:
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));


app.use(routerIndex);

const PORT = process.env.PORT;

sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL database connected successfully");
    // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));



if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
