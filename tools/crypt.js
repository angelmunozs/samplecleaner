var crypto = require('crypto')
var CryptoJS = require('crypto-js')

var crypt = {
	backend: function(data) {
	    var shasum = crypto.createHash('sha512')
	    shasum.update(data)
	    return shasum.digest('hex').substr(0, 30)
	},
	frontend: function(email, password) {
		return CryptoJS.SHA512(email + password).toString(CryptoJS.enc.Hex).substr(0, 30)
	}
}

crypt.chained = function(email, password) {
	return crypt.backend(crypt.frontend(email, password));
}

module.exports = crypt