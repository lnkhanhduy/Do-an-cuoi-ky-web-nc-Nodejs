const mongoose = require('mongoose')

const history = new mongoose.Schema({
    id: {
        type: String,
    },
    money: {
        type: Number,
    },
    sendername:{
        type: String
    },
    from:{
        type:String,
    },
    to:{
        type:String
    },
    date: {
        type: String,
    },
    action:{
        type: Number
    }
})

module.exports = mongoose.model('History', history)
