var twoDigits = function(d) {
    if(0 <= d && d < 10){
    	return "0" + d.toString()
    }
    if(-10 < d && d < 0) {
    	return "-0" + (-1*d).toString()
    }
    return d.toString()
}
//	To Mysql format
module.exports.toMysql = function(date) {
    return date.getUTCFullYear() + "-" +
    twoDigits(1 + date.getUTCMonth()) + "-" +
    twoDigits(date.getUTCDate()) + " " +
    twoDigits(date.getUTCHours()) + ":" +
    twoDigits(date.getUTCMinutes()) + ":" +
    twoDigits(date.getUTCSeconds())
}