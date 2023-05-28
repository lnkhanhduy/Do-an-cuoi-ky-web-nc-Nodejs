const mongoose = require('mongoose')

const creditaccount = new mongoose.Schema({
    idcard: {
        type: String,
    },
    expirationdate: {
        type: String,
    },
    idcvv: {
        type: String,
    },
})

module.exports = mongoose.model('Credit', creditaccount)
