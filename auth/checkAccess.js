const User = require('../model/users')
module.exports = (req,res,next) => {
    let user = req.session.user
    if(user)
    {
        User.findOne({_id:user._id},(err,u)=>{
            if(u.status == 0)
            {
                res.json("Tính năng này chỉ dành cho các tài khoản đã được xác minh")
            }
            else
            {
                next();
            }
        })
    }
    else
    {
        return res.redirect('/login')
    }
}