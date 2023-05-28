const express = require("express");
const Router = express.Router();
const User = require("../model/users");
const Credit = require("../model/creditaccount")
const History = require("../model/history")
const OTP = require("../model/otpreicever")

const {validationResult} = require('express-validator')
const loginValidator = require('./validator/loginValidator')
const registerValidator = require('./validator/registervalidator')
const creditValidator = require('./validator/creditValidator')
const sendEmailValidator = require("./validator/sendEmailValidator");

var nodemailer = require('nodemailer');
const checkLogin = require('../auth/checkLogin');
const checkAccess = require('../auth/checkAccess');
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const getTime = require('../public/js/getTime')
const uploader = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => {

            if(req.session.user)
            {
                let emailUser = req.session.user.email
                let imagesUserPath = path.join(__dirname, `users/${emailUser}/images`)
                if(!fs.existsSync(imagesUserPath))
                {
                    fs.mkdirSync(imagesUserPath,{ recursive: true });
                }
                callback(null, imagesUserPath);
            }
            else
            {
                let emailRegister = req.body.email
                let imagesUserPath = path.join(__dirname, `users/${emailRegister}/images`)
                if(!fs.existsSync(imagesUserPath))
                {
                    fs.mkdirSync(imagesUserPath,{ recursive: true });
                }
                callback(null, imagesUserPath);
            }
        }
    })
})

Router.use(express.static(path.join(__dirname, 'users')));


var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        secure: false,
        requireTLS: false,
        port: 25,
        auth: {
        user: "khanhduyhbvl20011@gmail.com",
        pass: "imblmghymguwxxfy",
    }
});



Router.post('/', checkLogin,uploader.fields([{name:'idfrontChange'},{name:"idbacksideChange"}]),(req, res) => {
    let body = req.body
    let user = req.session.user
    if(!user)
    {
        res.redirect('/login')
    }
    else
    {
        if(body.password)
        {
            User.findOne({email:user.email},(err,u) =>{
                if(u)
                {
                    User.updateOne({email:user.email},{password:body.password},function (err)
                    {
                        if (err) {
                            console.log(err)
                        }
                        else
                        {
                            User.updateOne({email:user.email},{firstLogin:false},function (err){
                                if (err) {
                                    console.log(err)
                                }
                            })
                        }
                    })
                }
            })
        }
        else if(body.newchangepassword)
        {
            User.findOne({email:user.email},(err,u) =>{
                if(u)
                {
                    if(u.password === body.oldpassword)
                    {
                        User.updateOne({email:user.email},{password:body.newchangepassword},function (err)
                        {
                            if (err) {
                                console.log(err)
                            }
                        })
                        return res.redirect('/')
                    }
                    else
                    {
                        let mess = 'Mật khẩu cũ không đúng'
                        req.flash('mess',mess)
                        return res.redirect('/')
                    }
                }
            })
        }
        else if(req.files)
        {
		let {idfrontChange,idbacksideChange} = req.files
            let newPathFront = path.join(__dirname, path.join(`users/${user.email}/images/${idfrontChange[0].originalname}`))
            let newPathBack = path.join(__dirname, path.join(`users/${user.email}/images/${idbacksideChange[0].originalname}`))

            let cmndfront = {
                path: newPathFront,
                name: path.basename(idfrontChange[0].originalname),
                imageType: idfrontChange[0].mimetype
            }
            let cmndback = {
                path: newPathBack,
                name: path.basename(idbacksideChange[0].originalname),
                imageType: idbacksideChange[0].mimetype
            }

            User.findOne({email:user.email},(err,u) =>{
                if(u)
                {
                    if(u.cmndfront.name !== cmndfront.name)
                    {
                        if(fs.existsSync(u.cmndfront.path))
                        {
                            fs.unlinkSync(u.cmndfront.path)
                        }
                    }
                    if(u.cmndback.name !== cmndback.name)
                    {
                        if(fs.existsSync(u.cmndback.path))
                        {
                            fs.unlinkSync(u.cmndback.path)
                        }
                    }
                    fs.renameSync(idfrontChange[0].path,newPathFront)
                    fs.renameSync(idbacksideChange[0].path,newPathBack)
                    User.findOneAndUpdate({_id:user._id},{status:0,cmndfront:cmndfront,cmndback:cmndback},{new: true},(err,doc) =>{
                        if (err) {
                            console.log(err)
                        }
                        return res.redirect('/')
                    })
                }
            })
        }
    }
    
})

Router.get('/search/:page',checkLogin,(req, res) => {
    let infor = req.session.user
    let user = []
    User.findOne({email:infor.email},(err,u) =>{
        if(u)
        {
            if(u.status==2)
            {
                req.session.destroy();
                return res.redirect('/login')
            }
            else
            {
                
                user.push({
                    id:u._id,
                    fullname:u.fullname,
                    username:u.username,
                    email:u.email,
                    phone:u.phone,
                    birthday:getTime.getDate(u.birthday),
                    address:u.address,
                    cmndfront:u.cmndfront,
                    cmndback:u.cmndback,
                })

                var perPage = 10
                , page =  Math.max(0, req.params.page) - 1;

                History.find({from:infor.email},(err, items) =>{
                    if(u)
                    {
                        return items
                    }
                }).sort({date:-1}).clone()
                .limit(perPage)
                .skip(perPage * page)
                .then(function(result) {

                    result= result.map(item=> item.toObject()).sort(function(a,b){
                        return new Date(b.date) - new Date(a.date);
                    });

                    History.count().exec(function(err, count) {
                        let totalPages = []
                        let pageTotal = Math.ceil(count / perPage)
                        let currentpage = page + 1

                        let prevPage = currentpage <= 1 ? 1 : currentpage - 1
                        let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1

                        let prevP = 1;
                        let nextP = pageTotal;

                        for(var i = 1;i<=pageTotal;i++)
                        {
                            totalPages.push(i)
                        }
                        return res.render('user/detailinfo', {
                            title: 'personal information', 
                            currPage: '' ,
                            layout: 'navUser', 
                            user,
                            result,
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal
                        })
                    })
                }).catch(function(err){ console.log(err)})
            }
        }
    })
})

Router.get('/', checkLogin,(req, res) => {
    let infor = req.session.user
    let user = []
    const mess = req.flash('mess') || ''

    User.findOne({email:infor.email},(err,u) =>{
        if(u)
        {
            if(u.status==2)
            {
                req.session.destroy();
                return res.redirect('/login')
            }
            else
            {
                
                user.push({
                    id:u._id,
                    fullname:u.fullname,
                    username:u.username,
                    email:u.email,
                    phone:u.phone,
                    birthday:getTime.getDate(u.birthday),
                    address:u.address,
                    cmndfront:u.cmndfront,
                    cmndback:u.cmndback,
                })

                var perPage = 10
                , page = 0
                History.find({from:infor.email},(err, items) =>{
                    if(items)
                    {
                        return items
                    }
                }).sort({date:-1}).clone()
                .limit(perPage)
                .skip(perPage * page)
                .then(function(result) {

                    result= result.map(item=> item.toObject()).sort(function(a,b){
                        return new Date(b.date) - new Date(a.date);
                    });

                    History.count().exec(function(err, count) {
                        let totalPages = []
                        let pageTotal = Math.ceil(count / perPage)
                        let currentpage = page + 1

                        let prevPage = currentpage <= 1 ? 1 : currentpage - 1
                        let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1

                        let prevP = 1;
                        let nextP = pageTotal;
                        for(var i = 1;i<=pageTotal;i++)
                        {
                            totalPages.push(i)
                        }

                        return res.render('user/detailinfo', {
                            title: 'personal information',
                            currPage: '' ,
                            fullname:infor.fullname,
                            layout: 'navUser', 
                            user,
                            mess,
                            result,
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal
                        })
                    })
                }).catch(function(err){ console.log(err)})
            }
        }
    })
})

Router.get('/access', function(req, res, next) {
    let user = req.session.user
    if(!user){
        res.redirect('/login')
    }else{
        User.findOne({email:user.email},(err,user) => {
            if(user)
            {
               if(user.status == 0)
               {
                    res.json({
                       status:user.status
                   })
               }
            }
        })
    }
});


Router.get('/firstLogin', function(req, res, next) {
    let user = req.session.user
    if(!user){
        res.redirect('/login')
    }else{
        User.findOne({email:user.email},(err,user) => {
            if(user)
            {
               if(user.firstLogin)
               {
                   res.json({
                       firstLogin:user.firstLogin
                   })
               }
            }
        })
    }
});


Router.get('/login', (req, res) => {
    let user = req.session.user
    if(user)
    {
        if(user.username == "admin")
        {
            return res.redirect('admin/waiting-activity');
        }
        return res.redirect('/');
    }
    const flash = req.flash("register_success");
    const error = req.flash('error') || ''
    const username = req.flash('username') || ''
    const password = req.flash('password') || ''
    return res.render('user/login',  {layout: 'main', error, username, password, flash})
})

Router.post('/login', loginValidator ,(req, res) => {
    let result = validationResult(req)
    let {username, password} = req.body
    if(result.errors.length === 0){
        User.findOne({username: username}, (err,user) => {
            if(user){
                if(username == "admin"){
                    if(password === user.password)
                    {
                        req.session.user = user;
                        return res.redirect('/admin/waiting-activity')
                    }
                    else
                    {
                        let message = 'Incorrect username or password'
                        req.flash('error',message)
                        req.flash('username',username)
                        return res.redirect('/login')
                    }
                }
                else if(user.status === 2)
                {
                    let message = "Tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008."
                    req.flash('error',message)
                    req.flash('username',username)
                    return res.redirect('/login')
                }
                else
                {
                    if(password === user.password){
                        req.session.user = user;
                        User.findByIdAndUpdate(user._id,{countFailed:0,abnormalLogin:0},(err,user)=>{
                            if(err)
                            {
                                console.log(err)
                            }
                        })
                        return res.redirect('/')
                    }
                    else
                    {
                        let count = user.countFailed + 1
                        if(count < 3)
                        {
                            User.findByIdAndUpdate(user._id,{countFailed:count},(err,user)=>{
                                if(err)
                                {
                                    console.log(err)
                                }
                            })
                        }   
                        else if(count == 3 && user.abnormalLogin == 0)
                        {
                            setTimeout(function(){
                                User.findByIdAndUpdate(user._id,{countFailed:0,abnormalLogin:1},(err,user)=>{
                                    if(err)
                                    {
                                        console.log(err)
                                    }
                                })
                            },60000)
                            let message = 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút.'
                            req.flash('error',message)
                            req.flash('username',username)
                            return res.redirect('/login')
                        }
                        else if(count == 3 && user.abnormalLogin == 1)
                        {
                            User.findByIdAndUpdate(user._id,{isBlock:true,lockTime:getTime.getDate()},(err,user)=>{
                                if(err)
                                {
                                    console.log(err)
                                }   
                            })
                            let message = 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ.'
                            req.flash('error',message)
                            req.flash('username',username)
                            return res.redirect('/login')
                        }

                        let message = 'Incorrect username or password'
                        req.flash('error',message)
                        req.flash('username',username)
                        return res.redirect('/login')
                    }
                }
            }else{
                let message = 'User not exist'
                req.flash('error',message)
                req.flash('username',username)
                return res.redirect('/login')
            }
        })
    }else{
        result = result.array()
        let message
        for(fields in result){
            message = result[fields].msg
            break
        }
    
        req.flash('error',message)
        req.flash('username',username)
        req.flash('password',password)
        return res.redirect('/login')
    }
})


Router.get('/register', (req, res) => {
    const message = req.flash('message') || ''
    return res.render('user/register', {
        layout: 'main',
        message:message
    })
})

Router.post('/register',uploader.fields([{name:'idfront'},{name:"idbackside"}]),registerValidator, (req, res,next) => {
    let result = validationResult(req)
    if(result.errors.length === 0)
    {

        let {name,email,phone,birth,address} = req.body
        let {idfront,idbackside} = req.files
        let username = getRandomUsername();
        let password = getRandomPassword()

        var mailOptions = {
            from: 'Admin',
            to: email,
            subject: `Sending Account to ${name}`,
            html: `Your Username: <strong>${username}</strong> and Password: <strong>${password}</strong>`
        };

        let newPathFront = path.join(__dirname, path.join(`users/${email}/images/${idfront[0].originalname}`))
        let newPathBack = path.join(__dirname, path.join(`users/${email}/images/${idbackside[0].originalname}`))

        let user = new User({
            username:username,
            fullname:name,
            password:password,
            email:email,
            phone:phone,
            birthday:birth,
            address: address,
            cmndfront: {
                path: newPathFront,
                name: path.basename(idfront[0].originalname),
                imageType: idfront[0].mimetype
            },
            cmndback: {
                path: newPathBack,
                name: path.basename(idbackside[0].originalname),
                imageType: idbackside[0].mimetype
            },
            status:0,
            countFailed:0,
            abnormalLogin:0,
            firstLogin:true,
            isBlock:false,
            money:0,
            withdrawTime:0
        })
        user.save().then(() =>{
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    fs.renameSync(idfront[0].path,newPathFront)
                    fs.renameSync(idbackside[0].path,newPathBack)
                }
            });
            req.flash("register_success", "<strong>Đăng ký tài khoản thành  công!</strong> Tài khoản và mật khẩu được chuyển đã chuyển về gmail");
            return res.redirect('login')
        })
        .catch(e =>{
            return res.json({
                code:2,
                message:"Đăng ký thất bại " + e.message
            })
        })    
    }
    else
    {
        let {idfront,idbackside} = req.files
        fs.unlinkSync(idfront[0].path)
        fs.unlinkSync(idbackside[0].path)

        let messages = result.mapped()
        let message = ''
        for(m in messages)
        {
            message = messages[m].msg
            break
        }
        req.flash('message',message)
        return res.redirect('/register')
    }
})


Router.get('/password-recovery', (req, res) => {
    res.render('user/passwordrecovery', {layout: 'main'})
})

Router.get('/OTP/:email', (req, res) => {
    const email = req.params.email
    console.log(email)
    res.render('user/otpreceiver', {
        layout: 'main',
        email
    })
})

Router.get('/reset-pass/:email', (req, res) => {
    const email = req.params.email
    res.render('user/resetpassword', {
        layout: 'main',
        email
    })
})

Router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

Router.get('/logout-modal', (req, res) => {

    req.session.destroy()
    res.redirect('/login')
})


function getRandomUsername() {
    var rand = (Math.floor(Math.random() * 10000000000) + 10000000000).toString().substring(1);
    return rand
}

function getRandomPassword() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

Router.get('/change-password', checkLogin,(req, res) => {
    console.log()
})

Router.get('/addmoney',checkLogin,checkAccess, (req, res) => {
    const error = req.flash('error') || ''
    const rechargemoney = req.flash('rechargemoney') || ''
    const idcard = req.flash('idcard') || ''
    const idcvv = req.flash('idcvv') || ''
    const expirationdate = req.flash('expirationdate') || ''
    res.render('user/addmoney', { layout: 'navUser' ,error, rechargemoney, idcard, idcvv, expirationdate})
})

Router.post('/addmoney', checkLogin,checkAccess,creditValidator, (req, res) => {
    let user = req.session.user
    let result = validationResult(req)
    let {rechargemoney,idcard,idcvv,expirationdate}  = req.body
    let formatdate = expirationdate.split('-').reverse().join('/')
    if(result.errors.length === 0){
        Credit.findOne({idcard: idcard}, (err,id) => {
            if(id){
                if(id.expirationdate === formatdate){
                    if(id.idcvv === idcvv){
                        if(idcvv === '411'){
                            
                            User.findOne({email:user.email},(err,u) =>{
                                if(u)
                                {
                                    let history = new History({
                                        id:'RC'.concat(getRandomPassword()),
                                        sendername:u.fullname,
                                        from:user.email,
                                        money:rechargemoney,
                                        date:getTime.getDate(),
                                        action:1,
                                    })
        
                                    history.save().then(() =>{
                                        History.find({from:user.email},(err,u) =>{
                                            if(u)
                                            {
                                                User.findOne({email:user.email},(err,u)=>{
                                                    if(u)
                                                    {
                                                        let total = 0
                                                        total = parseInt(u.money) + parseInt(rechargemoney)
                                                        User.findByIdAndUpdate(user._id,{money:total},(err,u)=>{
                                                            if(err)
                                                            {
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                    else
                                                    {
                                                        console.log(err)
                                                    }
                                                })
                                            }
                                        })
                                        return res.redirect('/addmoney')
                                    })
                                    .catch(e =>{
                                        console.log(e.message)
                                    })
                                }
                                else
                                {
                                    console.log(err)
                                }
                            })

                        }
                        else if(idcvv=== '443'){
                            if(rechargemoney > 1000000)
                            {
                                let message = 'Chỉ được nạp tối đa 1 triệu/lần'
                                req.flash('error',message)
                                req.flash('rechargemoney',rechargemoney)
                                req.flash('idcard',idcard)
                                req.flash('expirationdate',expirationdate)
                                req.flash('idcvv',idcvv)
                                return res.redirect('/addmoney')    
                            }
                            else
                            {
                                User.findOne({email:user.email},(err,u) =>{
                                    if(u)
                                    {
                                        let history = new History({
                                            id:'RC'.concat(getRandomPassword()),
                                            sendername:u.fullname,
                                            from:user.email,
                                            money:rechargemoney,
                                            date:getTime.getDate(),
                                            action:1,
                                        })
            
                                        history.save().then(() =>{
                                            History.find({from:user.email},(err,u) =>{
                                                if(u)
                                                {
                                                    let total = 0
                                                    u.map(i=>{
                                                        if(i.action === 1)
                                                        {
                                                            total+=i.money
                                                        }
                                                    })
                                                    User.updateOne({email:user.email},{money:total},(err,u)=>{
                                                        if(err)
                                                        {
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            })
                                            return res.redirect('/addmoney')
                                        })
                                        .catch(e =>{
                                            console.log(e.message)
                                        })
                                    }
                                    else
                                    {
                                        console.log(err)
                                    }
                                })
    
                                history.save().then(() =>{
                                    History.find({from:user.email},(err,u) =>{
                                        if(u)
                                        {
                                            let total = 0
                                            u.map(i=>{
                                                if(i.action === 1)
                                                {
                                                    total+=i.money
                                                }
                                            })
                                            User.updateOne({email:user.email},{money:total},(err,u)=>{
                                                if(err)
                                                {
                                                    console.log(err)
                                                }
                                            })
                                        }
                                    })
                                    return res.redirect('/addmoney')
                                })
                                .catch(e =>{
                                    console.log(e.message)
                                })
                            }
                        }else if(idcvv === '577'){
                            let message = 'Thẻ hết tiền'
                            req.flash('error',message)
                            req.flash('rechargemoney',rechargemoney)
                            req.flash('idcard',idcard)
                            req.flash('expirationdate',expirationdate)
                            req.flash('idcvv',idcvv)
                            return res.redirect('/addmoney')    
                        }
                    }
                    else{
                        let message = 'Mã cvv không đúng'
                        req.flash('error',message)
                        req.flash('rechargemoney',rechargemoney)
                        req.flash('idcard',idcard)
                        req.flash('expirationdate',expirationdate)
                        req.flash('idcvv',idcvv)
                        return res.redirect('/addmoney')
                    }
                }else{
                    let message = 'Số ngày hết hạn không đúng'
                    req.flash('error',message)
                    req.flash('rechargemoney',rechargemoney)
                    req.flash('idcard',idcard)
                    req.flash('expirationdate',expirationdate)
                    req.flash('idcvv',idcvv)
                    return res.redirect('/addmoney')
                }
            }
            // else{
            //     let message = 'Thẻ này không được hỗ trọ'
            //     req.flash('error',message)
            //     req.flash('rechargemoney',rechargemoney)
            //     req.flash('idcard',idcard)
            //     req.flash('expirationdate',expirationdate)
            //     req.flash('idcvv',idcvv)
            //     return res.redirect('/addmoney')
            // }
        })
    }else{
        result = result.array()
        let message
        for(fields in result){
            message = result[fields].msg
            break
        }
    
        req.flash('error',message)
        req.flash('rechargemoney',rechargemoney)
        req.flash('idcard',idcard)
        req.flash('expirationdate',expirationdate)
        req.flash('idcvv',idcvv)
        return res.redirect('/addmoney')
    }
})

Router.get('/withdrawmoney',checkLogin,checkAccess, (req, res) => {
    let user = req.session.user
    User.findOne({_id:user._id},(err,u) =>{
        if(u)
        {
            if(u.nextwithDraw)
            {
                var d1 = new Date();
                var d2 = new Date(u.nextwithDraw);
                if(d1.getTime() >= d2.getTime())
                {
                    User.findByIdAndUpdate(user._id,{$unset:{nextwithDraw:""},withdrawTime:0},(err,u) =>{
                        if(err)
                        {
                            console.log(err)
                        }
                    })
                }
            }
        }
        else
        {
            console.log(err)
        }
    })

    const error = req.flash('error') || ''
    const rechargemoney = req.flash('rechargemoney') || ''
    const idcard = req.flash('idcard') || ''
    const idcvv = req.flash('idcvv') || ''
    const expirationdate = req.flash('expirationdate') || ''
    const note = req.flash('note') || ''
    res.render('user/withdrawmoney', { layout: 'navUser' ,error, rechargemoney, idcard, idcvv, expirationdate,note})
})

Router.post('/withdrawmoney', checkLogin,checkAccess,creditValidator, (req, res) => {
    let user = req.session.user
    let result = validationResult(req)
    let {rechargemoney,idcard,idcvv,expirationdate,note}  = req.body
    let formatdate = expirationdate.split('-').reverse().join('/')
    if(result.errors.length === 0){
        Credit.findOne({idcard: idcard}, (err,id) => {
            if(id)
            {
                if(id.idcard === '111111')
                {
                    if(id.expirationdate === formatdate)
                    {
                        if(id.idcvv === idcvv){
                            if(idcvv === '411')
                            {
                                
                               if(rechargemoney % 50000 != 0)
                               {
                                    let message = 'Số tiền rút mỗi lần phải là bội số của 50,000 đồng.'
                                    req.flash('error',message)
                                    req.flash('rechargemoney',rechargemoney)
                                    req.flash('idcard',idcard)
                                    req.flash('expirationdate',expirationdate)
                                    req.flash('idcvv',idcvv)
                                    req.flash('note',note)
                                    return res.redirect('/withdrawmoney')
                               }
                               else
                               {
        
                                    User.findOne({email:user.email},(err,u)=>{
                                        if(u)
                                        {
                                            let time = u.withdrawTime
                                            if(time < 2)
                                            {
                                                if(rechargemoney >= 5000000)
                                                {
                                                    let totalwithdraw = 0
                                                    totalwithdraw = parseInt(rechargemoney) + parseInt(rechargemoney*0.05)
                                                    let total = parseInt(u.money) - parseInt(totalwithdraw);
                                                    if(total < 0)
                                                    {
                                                        let message = 'Số dư tài khoản không đủ'
                                                        req.flash('error',message)
                                                        req.flash('rechargemoney',rechargemoney)
                                                        req.flash('idcard',idcard)
                                                        req.flash('expirationdate',expirationdate)
                                                        req.flash('idcvv',idcvv)
                                                        req.flash('note',note)
                                                        return res.redirect('/withdrawmoney')
                                                    }
                                                    else
                                                    {
                                                        User.findOne({email:user.email},(err,u) =>{
                                                            if(u)
                                                            {
                                                                let history = new History({
                                                                    id:'WR'.concat(getRandomPassword()),
                                                                    from:user.email,
                                                                    sendername:u.fullname,
                                                                    money:rechargemoney,
                                                                    date:getTime.getDate(),
                                                                    action:3,
                                                                    note:note
                                                                })
                                                                history.save().then(() =>{
                                                                    User.updateOne({email:user.email},{withdrawTime:time + 1},(err,u)=>{
                                                                        if(err)
                                                                        {
                                                                            console.log(err)
                                                                        }
                                                                    })
                                                                    return res.redirect('/withdrawmoney')
                                                                })
                                                                .catch(e =>{
                                                                    console.log(e.message)
                                                                })
                                                            }
                                                            else
                                                            {
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                }
                                                else
                                                {
                                                    let totalwithdraw = 0
                                                    totalwithdraw = parseInt(rechargemoney) + parseInt(rechargemoney*0.05)
                                                    let total = parseInt(u.money) - parseInt(totalwithdraw);
                                                    if(total < 0)
                                                    {
                                                        let message = 'Số dư tài khoản không đủ'
                                                        req.flash('error',message)
                                                        req.flash('rechargemoney',rechargemoney)
                                                        req.flash('idcard',idcard)
                                                        req.flash('expirationdate',expirationdate)
                                                        req.flash('idcvv',idcvv)
                                                        req.flash('note',note)
                                                        return res.redirect('/withdrawmoney')
                                                    }
                                                    else
                                                    {
    
                                                        User.findOne({email:user.email},(err,u) =>{
                                                            if(u)
                                                            {
                                                                let history = new History({
                                                                    id:'WR'.concat(getRandomPassword()),
                                                                    from:user.email,
                                                                    sendername:u.fullname,
                                                                    money:rechargemoney,
                                                                    date:getTime.getDate(),
                                                                    action:2,
                                                                    note:note
                                                                })
                                                                history.save().then(() =>{
                                                                    User.updateOne({email:user.email},{money:total,withdrawTime:time + 1},(err,u)=>{
                                                                        if(err)
                                                                        {
                                                                            console.log(err)
                                                                        }
                                                                    })
                                                                    return res.redirect('/withdrawmoney')
                                                                })
                                                                .catch(e =>{
                                                                    console.log(e.message)
                                                                })
                                                            }
                                                            else
                                                            {
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                            else
                                            {
                                            
                                                var date = new Date();
                                                date.setDate(date.getDate() + 1);
                                                date.setHours(0,0,0,0);
                                                var d = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
                                                var t = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

                                                User.findByIdAndUpdate(u._id,{nextwithDraw:(d+ ' '+t)},(err,i)=>{
                                                    if(err)
                                                    {
                                                        console.log(err)
                                                    }
                                                })
                                                let message = 'Mỗi ngày chỉ được tạo tối đa 2 giao dịch rút tiền.'
                                                req.flash('error',message)
                                                req.flash('rechargemoney',rechargemoney)
                                                req.flash('idcard',idcard)
                                                req.flash('expirationdate',expirationdate)
                                                req.flash('idcvv',idcvv)
                                                req.flash('note',note)
                                                return res.redirect('/withdrawmoney')
                                            }
                                        
                                        }
                                    })
                               }
                            }
                        }
                        else{
                            let message = 'Mã cvv không đúng'
                            req.flash('error',message)
                            req.flash('rechargemoney',rechargemoney)
                            req.flash('idcard',idcard)
                            req.flash('expirationdate',expirationdate)
                            req.flash('idcvv',idcvv)
                            return res.redirect('/withdrawmoney')
                        }
                    }
                    else{
                        let message = 'Số ngày hết hạn không đúng'
                        req.flash('error',message)
                        req.flash('rechargemoney',rechargemoney)
                        req.flash('idcard',idcard)
                        req.flash('expirationdate',expirationdate)
                        req.flash('idcvv',idcvv)
                        req.flash('note',note)
                        return res.redirect('/withdrawmoney')
                    }
            
                }
                else
                {
                    let message = 'Thẻ này không được hỗ trợ để rút tiền'
                    req.flash('error',message)
                    req.flash('rechargemoney',rechargemoney)
                    req.flash('idcard',idcard)
                    req.flash('expirationdate',expirationdate)
                    req.flash('idcvv',idcvv)
                    req.flash('note',note)
                    return res.redirect('/withdrawmoney')    
                }
                
            }
            else{
                let message = 'Thông tin thẻ không hợp lệ'
                req.flash('error',message)
                req.flash('rechargemoney',rechargemoney)
                req.flash('idcard',idcard)
                req.flash('expirationdate',expirationdate)
                req.flash('idcvv',idcvv)
                req.flash('note',note)
                return res.redirect('/withdrawmoney')
            }
        })
    }else{
        result = result.array()
        let message
        for(fields in result){
            message = result[fields].msg
            break
        }
    
        req.flash('error',message)
        req.flash('rechargemoney',rechargemoney)
        req.flash('idcard',idcard)
        req.flash('expirationdate',expirationdate)
        req.flash('idcvv',idcvv)
        req.flash('note',note)
        return res.redirect('/withdrawmoney')
    }
})

User.find((err, user) => {
    if(user.length) return 

    new User({
        username: "admin",
        password: "123456",
        fullname: "Nghĩa Nguyễn",
    }).save()
})

Credit.find((err, credit) => {
    if(credit.length) return 

    new Credit({
        idcard: "111111",
        expirationdate: "10/10/2022",
        idcvv: "411",
    }).save()

    new Credit({
        idcard: "222222",
        expirationdate: "11/11/2022",
        idcvv: "443",
    }).save()

    new Credit({
        idcard: "333333",
        expirationdate: "12/12/2022",
        idcvv: "577",
    }).save()
})
;

Router.post("/send-email", sendEmailValidator, function (req, res, next) {
    let result = validationResult(req);
    if (result.errors.length > 0) {
      return res.render("user/passwordrecovery", {
        layout: "main",
        message: result.errors[0].msg,
      });
    } else {
      const email = req.body.email;
      User.findOne({ email: email }, (err, user) => {
        if (user) {
          const otp = Math.floor(Math.random() * 1000000);
          new OTP({
            email: email,
            value: otp,
          }).save();
  
          var mainOptions = {
            from: "Admin",
            to: email,
            subject: "Reset password",
            html: "<p>Your OTP: <strong>" + otp + "</strong></p>",
          };
  
          transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
              console.log("Error: " + err);
              //   res.redirect("/");
            } else {
              setTimeout(function () {
                OTP.findOne({ value: otp }, (err, o) => {
                  if (o) {
                    OTP.findByIdAndUpdate(
                      o._id,
                      { value: Math.floor(Math.random() * 1000000) },
                      (err, o) => {
                        if (err) {
                          console.log(err);
                        }
                      }
                    );
                  }
                });
              }, 60000);
              res.redirect(`/OTP/${email}`);
            }
          });
        } else {
          res.render("user/passwordrecovery", {
            layout: "main",
            message: "Email not exist",
          });
        }
      });
    }
});
  

Router.post("/OTP/:email", (req, res) => {
    const otp = req.body.otp;
    const email = req.params.email
    OTP.findOne({value:otp},(err,o)=>{
        if(o)
        {
            res.redirect(`/reset-pass/${email}`)
        }
        else
        {
            let message = "Sai mã OTP"
            res.render('user/otpreceiver', {
                layout: 'main',
                email,
                message
            })
        }
    })
});
  
Router.post("/reset-pass/:email", (req, res) => {
    const { newpassword,comfirmnewpassword } = req.body;
    const email = req.params.email
    var message = ''
    if(newpassword === '')
    {
        message = "Vui lòng nhập mật khẩu mới"
    }
    else if(comfirmnewpassword === '')
    {
        message = "Vui lòng xác nhận mật khẩu"
    }
    else if(newpassword !== comfirmnewpassword)
    {
        message = "Xác nhận lại mật khẩu không khớp"
    }

    if(message.length)
    {
        res.render('user/resetpassword', {
            layout: 'main',
            email,
            message
        })
    }
    else
    {
        User.findOne({email:email},(err,user) =>{
            if(user)
            {
                User.findByIdAndUpdate(user._id,{password:newpassword},(err,u)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                })
                res.redirect('/login')
            }
            else
            {
                console.log(err)
            }
        })
    }
});

module.exports = Router
