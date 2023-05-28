module.exports = (req,res,next) => {
    let user = req.session.user
    if(user)
    {
        if(user.username === "admin")
        {
            next();
        }
        else
        {
            return res.redirect('/login')
        }
    }
    else
    {
        return res.redirect('/login')
    }
}