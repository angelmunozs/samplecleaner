var path = require('path')
var nodemailer = require('nodemailer')

exports.name = "Nodemailer"
exports.order  = 3

exports.load = function(cb) {

	global.transporter = nodemailer.createTransport({
		service : config.EMAIL_SERVICE,
		auth : {
			user : config.EMAIL_USER,
			pass : config.EMAIL_PASS
		}
	})

    cb()
}