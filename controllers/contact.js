//	Requirements
var async 		= require('async')
var nodemailer 	= require('nodemailer')
var date 		= require('../tools/dates')
var validate 	= require('../tools/validate')

//	Contact
module.exports.send = function(req, res, next) {

	if(!req.body.email || !req.body.email.length || !req.body.message || req.body.message.length < 5) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var email = req.body.email || null
	var message = req.body.message || null
	var contact_type = 'Contacto web'
	if(message.indexOf('La reducción de ruido falló: ID #') != -1) {
		contact_type = "Proceso fallido"
	}

	if(!validate.email(email) && email != 'Anónimo') {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	async.series([
		//	Insert into database
		function isertIntoDatabase (cb) {
			Query('INSERT INTO contact (email, message, type, createdAt) VALUES (?, ?, ?, ?)', [email, message, contact_type, date.toMysql(new Date())])
			.then(function () {
				cb()
			})
			.catch(cb)
		},
		//	Send e-mail to us
		function mailUs (cb) {

			var html = '<img style="margin-bottom: 20px; max-height: 33px;" src="http://samplecleaner.com/img/logo1.small.png" alt="Sample Cleaner">' +
						'<div style="font-family:Arial; font-size:15px; margin-bottom: 5px;"><b>Remitente</b>: ' + email + '</div>' +
						'<div style="font-family:Arial; font-size:15px; margin-bottom: 20px;"><b>Fecha</b>: ' + date.toMysql(new Date()) + '</div>' +
						'<hr style="color: #ddd">' +
						'<div style="font-family:Arial; font-size:15px; margin-top: 20px;"><p><b>Consulta</b>:</p><p>' + message + '</p></div>'

			var mailOptions = {
				from: email,
				to: config.EMAIL_USER,
				subject: contact_type + ': ' + email,
				text: message,
				html: html
			}

			transporter.sendMail(mailOptions, function (error, info) {
				if(error) {
					cb(error)
				}
				console.log('Message sent: ' + info.response)
				cb()
			})
		}
	], function (error, data) {
		if (error) {
			req.error = error
			return next()
		}
		return next()
	})
}
