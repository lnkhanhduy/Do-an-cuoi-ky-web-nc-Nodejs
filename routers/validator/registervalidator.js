const {check } = require('express-validator');
const User = require('../../model/users')
const registervalidator = [
    check('name').exists().withMessage('Vui lòng nhập tên người dùng')
    .notEmpty().withMessage('Không được để trống tên người dùng'),

    check('email').exists().withMessage('Vui lòng nhập email người dùng')
    .notEmpty().withMessage('Không được để trống email người dùng')
    .isEmail().withMessage('Email không hợp lệ')
    .custom((value) =>{
        var query = User.find({email: value})
        return query.exec().then(user => {
            if (user.length > 0) {
                 return Promise.reject('E-mail đã được sử dụng');
            }
        });
    }),
    
    check('phone').exists().withMessage('Vui lòng nhập số điện thoại')
    .notEmpty().withMessage('Không được để trống số điện thoại')
    .custom((value) =>{
        var query = User.find({ phone: value})
        return query.exec().then(user => {
            if (user.length > 0) {
                return Promise.reject('Số điện thoại đã được sử dụng');
            }
        });
    }),

    check('birth').exists().withMessage('Vui lòng nhập ngày sinh')
    .notEmpty().withMessage('Không được để trống số ngày sinh')
    .matches(/^(\d{4})-0?(\d+)-0?(\d+)[T ]0?(\d+):0?(\d+):0?(\d+)$/).withMessage('Ngày sinh không hợp lệ'),

    check('address').exists().withMessage('Vui lòng nhập địa chỉ')
    .notEmpty().withMessage('Không được để trống địa chỉ'),

    check('idfront')
    .custom((value,{req,next}) =>{
        var imgFront = req.files.idfront
        if(imgFront)
        {
            return true;
        }
        else
        {
            return false
        }
    }).withMessage("Không được để trống CMND/CCCD mặt trước"),
        
    check('idbackside')
    .custom((value,{req,next}) =>{
        var imgBack = req.files.idbackside
        if(imgBack)
        {
            return true;
        }
        else
        {
            return false
        }
    }).withMessage("Không được để trống CMND/CCCD mặt sau"),
]

module.exports = registervalidator