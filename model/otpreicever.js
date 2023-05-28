const mongoose = require('mongoose')

const otprecovery = new mongoose.Schema({
    email:{
        type:String
    },
    value: {
        type: String,
    },
})

module.exports = mongoose.model('Recovery', otprecovery)
