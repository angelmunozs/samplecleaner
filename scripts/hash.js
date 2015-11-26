var crypto = require('crypto');
var CryptoJS = require('crypto-js');

var usage = function () {
	console.log('You must provide 2 parameters:\n\t- E-mail\n\t- Password')
	console.log('* Example: node scripts/hash.js test@test.com Password01')
}

var main = function (email, password) {
	var user = { email: email, password: password }

	var hash1 = CryptoJS.SHA512(user.email + user.password)
		        .toString(CryptoJS.enc.Hex)
		        .substr(0, 30)

	var shasum = crypto.createHash('sha512')
	shasum.update(user.email + hash1)
	var hash2 = shasum.digest('hex').substr(0, 30)

	console.log('Frontend hash:\t%s', hash1)
	console.log('Backend hash:\t%s', hash2)
}

if(process.argv.length < 4) {
	usage()
}
else {
	main(process.argv[2], process.argv[3])
}