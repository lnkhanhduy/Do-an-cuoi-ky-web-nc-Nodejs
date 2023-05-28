const User = require('./users')
const Credit = require('./creditaccount')

User.find((err, user) => {
    if(user.length) return 

    new User({
        username: "admin",
        password: "123456",
        fullname: "Admin",
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