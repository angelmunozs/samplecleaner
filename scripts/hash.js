var crypto = require('crypto');
var CryptoJS = require('crypto-js');
var user = { email: 'angel.munoz.sagaseta@gmail.com', password: 'iamtheadmin' }


var hash1 = CryptoJS.SHA512(user.email + user.password)
	        .toString(CryptoJS.enc.Hex)
	        .substr(0, 30)

var shasum = crypto.createHash('sha512')
shasum.update(user.email + hash1)
var hash2 = shasum.digest('hex').substr(0, 30)

console.log(hash1)
console.log(hash2)