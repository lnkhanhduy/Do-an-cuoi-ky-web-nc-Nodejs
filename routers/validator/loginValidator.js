const {check}  = require('express-validator')

module.exports = [
    check('username')
    .exists().withMessage('Please enter your username')
    .notEmpty().withMessage('Please enter a vail username'),

    check('password')
    .exists().withMessage('Please enter your password')
    .notEmpty().withMessage('Please enter a vail password')
    .isLength({min: 6}).withMessage('Passwords must be at least 6 characters'),

]