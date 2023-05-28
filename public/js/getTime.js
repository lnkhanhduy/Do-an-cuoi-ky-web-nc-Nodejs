module.exports.getDate = (date) => {
    if(date)
    {
        var today = new Date(date);
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
        if(today.getHours() >= 12)
        {
            return date + ' '+ time + ' '+  "PM"
        }
        else
        {
            return date + ' '+ time + ' '+  "AM"
        }
    }
    else
    {
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
        if(today.getHours() >= 12)
        {
            return date + ' '+ time + ' '+  "PM"
        }
        else
        {
            return date + ' '+ time + ' '+  "AM"
        }
    }
}