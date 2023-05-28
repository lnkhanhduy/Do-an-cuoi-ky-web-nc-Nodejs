const express = require('express')
const Router = express.Router()
const checkLogin = require('../auth/checkLogin');
const checkAdminLogin = require('../auth/checkAdminLogin');
const getTime = require('../public/js/getTime')
const {validationResult} = require('express-validator')
const loginValidator = require('./validator/loginValidator')
const User = require("../model/users");
const History = require("../model/history")


Router.get('/waiting-activity',checkAdminLogin, (req, res) => {
    let admin = req.session.user
    let user =[]

    User.find({username:{$ne:admin.username}} ,(err,u) =>{
        if(u)
        {
            u.map(i=>{
                if(i.status === 0 && i.isBlock === false || i.status === 3 && i.isBlock === false)
                {
                    user.push({
                        id:i._id,
                        fullname:i.fullname,
                        username:i.username,
                        email:i.email,
                        phone:i.phone,
                        birthday:getTime.getDate(i.birthday),
                        address:i.address,
                        cmndfront:i.cmndfront,
                        cmndback:i.cmndback,
                    })
                }
            })
        }
        else
        {
            console.log(err)
        }
    })
    res.render('admin/listwaitingactivity', {
        title: 'users list', 
        currPage: '• waiting activation' ,
        layout: 'navAdmin',
        user:user,
        fullname:admin.fullname
    })
})

Router.get('/activated',checkAdminLogin, (req, res) => {
    let admin = req.session.user
    let user =[]
    User.find({username:{$ne:admin.username}} ,(err,u) =>{
        if(u)
        {
            u.map(i=>{
                if(i.status === 1 &&  i.isBlock === false)
                {
                    user.push({
                        id:i._id,
                        fullname:i.fullname,
                        username:i.username,
                        email:i.email,
                        phone:i.phone,
                        birthday:getTime.getDate(i.birthday),
                        address:i.address,
                        cmndfront:i.cmndfront,
                        cmndback:i.cmndback,
                    })
                }
            })
        }
        else
        {
            console.log(err)
        }
    })
    res.render('admin/listactivated', {
        title: 'users list', 
        currPage: '• activated' ,
        layout: 'navAdmin',
        user:user})
})

Router.get('/disabled',checkAdminLogin, (req, res) => {
    let admin = req.session.user
    let user =[]
    User.find({username:{$ne:admin.username}} ,(err,u) =>{
        if(u)
        {
            u.map(i=>{
                if(i.status === 2 && i.isBlock === false)
                {
                    user.push({
                        id:i._id,
                        fullname:i.fullname,
                        username:i.username,
                        email:i.email,
                        phone:i.phone,
                        birthday:getTime.getDate(i.birthday),
                        address:i.address,
                        cmndfront:i.cmndfront,
                        cmndback:i.cmndback,
                    })
                }
            })
        }
        else
        {
            console.log(err)
        }
    })
    res.render('admin/listdisabled', {
        title: 'users list', 
        currPage: '• disabled' ,
        layout: 'navAdmin',
        user
    })
})

Router.get('/locked-indefinitely',checkAdminLogin, (req, res) => {
    let admin = req.session.user
    let user =[]
    User.find({username:{$ne:admin.username}} ,(err,u) =>{
        if(u)
        {
            u.map(i=>{
                if(i.isBlock)
                {
                    user.push({
                        id:i._id,
                        fullname:i.fullname,
                        username:i.username,
                        email:i.email,
                        phone:i.phone,
                        birthday:getTime.getDate(i.birthday),
                        address:i.address,
                        cmndfront:i.cmndfront,
                        cmndback:i.cmndback,
                        lockTime:i.lockTime,
                    })
                }
            })
        }
        else
        {
            console.log(err)
        }
    })
    return res.render('admin/listlockedindefinitely', {
        title: 'users list', 
        currPage: '• listlocked indefinitely' ,
        layout: 'navAdmin',
        user
    })
})

Router.get('/transaction-approval/:page',checkAdminLogin, (req, res) => {
    var perPage = 10
    , page =  Math.max(0, req.params.page) - 1;

    History.find({$or:[{action:2},{action:3}]},(err, items) =>{
        if(items)
        {
            console.log(items)
            return items
        }
    }).sort({date:1}).clone()
    .limit(perPage)
    .skip(perPage * page)
    .then(function(result) {

        result= result.map(item=> item.toObject()).sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        });

        History.count({$or:[{action:2},{action:3}]}).exec(function(err, count) {
            console.log(count)
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

            return res.render('admin/listtransactionapproval', {
                title: 'transaction approval', 
                currPage: '' ,
                layout: 'navAdmin', 
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

})

Router.get('/transaction-approval',checkAdminLogin, (req, res) => {

    var perPage = 10
    , page = 0
    History.find({$or:[{action:2},{action:3}]},(err, items) =>{
        if(items)
        {
            return items
        }
    }).sort({date:1}).clone()
    .limit(perPage)
    .skip(perPage * page)
    .then(function(result) {

        result= result.map(item=> item.toObject()).sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        });

        History.count({$or:[{action:2},{action:3}]}).exec(function(err, count) {
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

            return res.render('admin/listtransactionapproval', {
                title: 'transaction approval', 
                currPage: '' ,
                layout: 'navAdmin', 
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

})

Router.get('/detail-user/:id/search/:page',checkAdminLogin,(req, res) => {
    let id = req.params.id
    let user =[]
    User.findOne({_id:id},(err,u) =>{
        if(u)
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
                status:u.status,
                isBlock:u.isBlock
            })

            var perPage = 10
            , page =  Math.max(0, req.params.page) - 1;

            History.find({from:u.email},(err, items) =>{
                if(u)
                {
                    return items
                }
            }).sort({date:-1}).clone()
            .limit(perPage)
            .skip(perPage * page)
            .then(function(result) {

                result= result.map(item=> item.toObject())

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
                    return res.render('admin/detailuser', {
                        title: 'detail user',
                        currPage: `• ${u.fullname}` ,
                        layout: 'navAdmin', 
                        id,
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
    })
})

Router.get('/detail-user/:id',checkAdminLogin, (req, res) => {
    let id = req.params.id
    let user =[]
    User.findOne({_id:id},(err,u) =>{
        if(u)
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
                status:u.status,
                isBlock:u.isBlock
            })
            var perPage = 10
            , page = 0
            History.find({from:u.email},(err, items) =>{
                if(items)
                {
                    return items
                }
            }).sort({date:-1}).clone()
            .limit(perPage)
            .skip(perPage * page)
            .then(function(result) {

                result= result.map(item=> item.toObject())

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

                    return res.render('admin/detailuser', {
                        title: 'detail user',
                        currPage: `• ${u.fullname}` ,
                        layout: 'navAdmin', 
                        id,
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
    })
})

Router.post('/detail-user/:id',checkAdminLogin, (req, res) => {
    let id = req.params.id
    let body = req.body

    if(body.verification)
    {
        User.findOne({_id:id},(err,user) =>{
            if(user)
            {
                User.findByIdAndUpdate(user.id,{status:body.verification},(err,user)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                })
            }
            return res.redirect('/admin/activated')
        })  
    }
    else if (body.cancel)
    {
        User.findOne({_id:id},(err,user) =>{
            if(user)
            {
                User.findByIdAndUpdate(user.id,{status:body.cancel},(err,user)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                })
            }
            return res.redirect('/admin/disabled')
        })  
    }
    else if(body.additional)
    {

        User.findOne({_id:id},(err,user) =>{
            if(user)
            {
                User.findByIdAndUpdate(user.id,{status:body.additional},(err,user)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                })
            }
            return res.redirect('/admin/waiting-activity')
        })  
    }
    else if(body.unlock)
    {
        User.findOne({_id:id},(err,user) =>{
            if(user)
            {
                if(user.status === 0)
                {
                    User.findByIdAndUpdate(user.id,{isBlock:body.unlock,$unset:{lockTime:""},countFailed:0,abnormalLogin:0},(err,user)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                    })
                    return res.redirect('/admin/waiting-activity')
                }
                else if(user.status === 1)
                {
                    User.findByIdAndUpdate(user.id,{isBlock:body.unlock,$unset:{lockTime:""},countFailed:0,abnormalLogin:0},(err,user)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                    })
                    return res.redirect('/admin/activated')
                }
            }
        }) 
    }

    // if(number == 3)
    // {
    //     User.findOne({_id:id},(err,user) =>{
    //         if(user)
    //         {
    //             User.findByIdAndUpdate(user.id,{status:number},(err,user)=>{
    //                 if(err)
    //                 {
    //                     console.log(err)
    //                 }
    //             })
    //         }
    //     })  
    //     res.redirect('/admin/activated')
    // }
})


module.exports = Router