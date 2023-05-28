require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()

app.set('env', 'development')

switch(app.get('env')){
    case 'development':
        mongoose.connect(process.env.STRINGDEV)
        console.log(`Connect db success - ${app.get('env')}`)
        break
    case 'production':
        mongoose.connect(process.env.STRINGPROD)
        console.log(`Connect db success - ${app.get('env')}`)
        break
}
