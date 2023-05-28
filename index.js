require("dotenv").config();
const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const reduceOp = function (args, reducer) {
  args = Array.from(args);
  args.pop(); // => options
  var first = args.shift();
  return args.reduce(reducer, first);
};
// Model
const Users = require("./model/users");
// db
const db = require("./db");

// routers
const usersRouter = require("./routers/user");
const adminRouter = require("./routers/admin");

const app = express();

app.engine(
  "handlebars",
  expressHandlebars.engine({
    helpers: {
      compare: function (value1, operator, value2, options) {
        var operators = {
          eq: function (l, r) {
            return l === r;
          },
          noteq: function (l, r) {
            return l !== r;
          },
          gt: function (l, r) {
            return Number(l) > Number(r);
          },
          or: function (l, r) {
            return l || r;
          },
          and: function (l, r) {
            return l && r;
          },
          "%": function (l, r) {
            return l % r === 0;
          },
        };

        result = operators[operator](value1, value2);

        if (result) return options.fn(this);
        else return options.inverse(this);
      },
      eq: function () {
        return reduceOp(arguments, (a, b) => a === b);
      },
      ne: function () {
        return reduceOp(arguments, (a, b) => a !== b);
      },
      lt: function () {
        return reduceOp(arguments, (a, b) => a < b);
      },
      gt: function () {
        return reduceOp(arguments, (a, b) => a > b);
      },
      lte: function () {
        return reduceOp(arguments, (a, b) => a <= b);
      },
      gte: function () {
        return reduceOp(arguments, (a, b) => a >= b);
      },
      and: function () {
        return reduceOp(arguments, (a, b) => a && b);
      },
      or: function () {
        return reduceOp(arguments, (a, b) => a || b);
      },
      inc: function (value, options) {
        return parseInt(value) + 1;
      },
      addDos: function (value) {
        value += "";
        x = value.split(".");
        x1 = x[0];
        x2 = x.length > 1 ? "." + x[1] : "";
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
          x1 = x1.replace(rgx, "$1" + "." + "$2"); // changed comma to dot here
        }
        return x1 + x2;
      },
    },
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("CUOIKY"));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "secret",
  })
);
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "handlebars");

// use Router
app.use("/", usersRouter);
app.use("/admin", adminRouter);

const port = process.env.PORT || 3000;
app.listen(
  port,
  console.log(
    "\nUser" +
      `\nhttp://localhost:${port}` +
      `\nhttp://localhost:${port}/login` +
      `\nhttp://localhost:${port}/register` +
      "\n\nAdmin" +
      `\nhttp://localhost:${port}/admin/activated` +
      `\nhttp://localhost:${port}/admin/login`
  )
);
