const User = require('../model/users')
module.exports = (req,res,next) => {
    let user = req.session.user

    if(user)
    {
        User.findOne({_id:user._id},(err,u) =>{
            if(u)
            {
                if(u.username !== "admin")
                {
                    next();
                }
                else
                {
                    return res.redirect('/admin/waiting-activity')
                }
            }
            else
            {
                req.session.destroy();
                return res.redirect('/login')
            }
        })
    }
    else
    {
        return res.redirect('/login')
    }
}