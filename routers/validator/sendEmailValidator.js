const { check } = require("express-validator");

module.exports = [
  check("email")
    .notEmpty()
    .withMessage("Email not empty")
    .exists()
    .withMessage("Please enter your email")
    .isEmail()
    .withMessage("Please enter a valid email"),
];
