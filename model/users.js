const mongoose = require('mongoose')

const user = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    birthday: {
        type: Date,
    },
    address: {
        type: String,
    },
    cmndfront: {
        path:String,
        name:String,
        imageType:String
    },
    cmndback: {
        path:String,
        name:String,
        imageType:String
    },
    fullname: {
        type: String,
    },
    countlogin: {
        type: String,
    },
    firstLogin: {
        type: Boolean
    },
    status: {
        type: Number,
    },
    //1. waitConfirm 2. confirmed 3.waitUpdate 4. bannedMany
    countFailed: {
        type: Number,
    },
    abnormalLogin:{
        type: Number
    },
    isBlock:{
        type:Boolean
    },
    lockTime:{
        type:String
    },
    money:{
        type:Number
    },
    withdrawTime:{
        type:Number
    },
    nextwithDraw:{
        type:String
    }
})

module.exports = mongoose.model('Users', user)
