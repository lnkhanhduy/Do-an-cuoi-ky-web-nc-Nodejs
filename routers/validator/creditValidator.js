const {check}  = require('express-validator')
const Credit = require('../../model/creditaccount')

module.exports = [
    check('rechargemoney')
    .exists().withMessage('Vui lòng nhập số tiền')
    .notEmpty().withMessage('Vui lòng nhập số tiền')
    .isNumeric().withMessage('Số tiền phải là số'),

    check('idcard')
    .exists().withMessage('Vui lòng nhập số thẻ')
    .notEmpty().withMessage('Vui lòng nhập số thẻ')
    .isNumeric().withMessage('Số thẻ phải là số')
    .isLength({min:6,max:6}).withMessage('Số thẻ phải gồm 6 chữ số')
    .custom((value) =>{
        var query = Credit.find({idcard: value})
        return query.exec().then(card => {
            if (card.length == 0) {
                return Promise.reject('Thẻ này không được hỗ trọ');
            }
        });
    }),

    check('expirationdate')
    .exists().withMessage('Vui lòng nhập chọn ngày hết hạn')
    .notEmpty().withMessage('Vui lòng nhập ngày hết hạn'),

    check('idcvv')
    .exists().withMessage('Vui lòng nhập mã cvv')
    .notEmpty().withMessage('Vui lòng nhập mã cvv')
    .isNumeric().withMessage('Mã cvv phải là số')
]