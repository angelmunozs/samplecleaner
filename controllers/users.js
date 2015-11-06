//	Requirements
var _ 			= require('underscore')
var async 		= require('async')
var nodemailer 	= require('nodemailer')
var site 		= require('../controllers')
var crypt 		= require('../tools/crypt')
var date 		= require('../tools/dates')
var utils 		= require('../tools/utils')
var validate 	= require('../tools/validate')

//	Create user
module.exports.create = function(req, res, next) {

	if(_.isEmpty(req.body)) {
		req.error = Errores.CUERPO_VACIO
		return next()
	}

	var user = {
		email : req.body.email || null,
		password : req.body.password || null,
		nombre : req.body.nombre || null
	}

	if(utils.emptyFields(user)) {
		req.error = Errores.CAMPOS_VACIOS
		return next()
	}

	if(!validate.email(user.email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	if(user.password.length != 20) {
		req.error = Errores.PASSWORD_FORMATO_INCORRECTO
		return next()
	}

	async.series([
		//	Comprueba que no ha sido ya registrado
		function checkEmail(cb) {
			Query("SELECT email FROM users WHERE email LIKE ?", [user.email])
			.then(function (rows) {
				if(rows[0].length) {
					return cb(Errores.USUARIO_EXISTE)
				}
				cb()
			})
			.catch(cb)
		},
		//	Crea el user
		function createUser(cb) {
			user.hash = crypt.backend(user.email + user.password);
			Query("INSERT INTO users (email, password, nombre, createdAt, disabled) VALUES (?, ?, ?, ?)", [user.email, user.hash, user.nombre, date.toMysql(new Date()), 1])
			.then(function() {
				cb()
			})
			.catch(cb)
		},
		//	Asigna el grupo de usuario básico
		function assignGroup(cb) {
			Query("SELECT idGroup FROM groups WHERE group LIKE ?", ['basic'])
			.then(function (rows) {
				Query("INSERT INTO user_groups (idUser, idGroup, createdAt) VALUES (?, ?, ?)", [user.idUser, rows[0][0].idGroup, date.toMysql(new Date())])
				cb()
			})
			.catch(cb)
		}
	], function (error, data) {
		if (error) {
			req.error = error
			return next()
		}
		return next()
	})
}

//	Join mailing list
module.exports.enterMailingList = function(req, res, next) {

	if(!req.body.email || !req.body.email.length) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var email = req.body.email || null

	if(!validate.email(email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	var action = 'create'

	async.series([
		//	Check if it has already been inserted
		function checkIfExists (cb) {
			Query('SELECT email FROM mailing_list WHERE email LIKE ?', [email])
			.then(function (rows) {
				if(rows[0].length) {
					action = 'update'
				}
				cb()
			})
			.catch(cb)
		},
		//	Insert new email or update state
		function joinMailinglist (cb) {
			switch(action) {
				case 'update' :
					Query('UPDATE mailing_list SET disabled = ? WHERE email LIKE ?', [0, email])
					.then(function () {
						cb()
					})
					.catch(cb)
					break
				default :
					Query('INSERT INTO mailing_list (email, createdAt, disabled) VALUES (?, ?, ?)', [email, date.toMysql(new Date()), 0])
					.then(function () {
						cb()
					})
					.catch(cb)
			}
		}
	], function (error, data) {
		if (error) {
			req.error = error
			return next()
		}
		return next()
	})
}

//	Quit mailing list
module.exports.quitMailingList = function(req, res, next) {

	if(!req.body.email || !req.body.email.length) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var email = req.body.email || null

	if(!validate.email(email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	async.series([
		//	Check if it's on the list
		function checkIfExists (cb) {
			Query('SELECT email FROM mailing_list WHERE email LIKE ?', [email])
			.then(function (rows) {
				if(!rows[0].length) {
					return cb(Errores.NO_EN_LA_LISTA)
				}
				cb()
			})
			.catch(cb)
		},
		//	Disable email
		function joinMailinglist (cb) {
			Query('UPDATE mailing_list SET disabled = ? WHERE email LIKE ?', [1, email])
			.then(function () {
				cb()
			})
			.catch(cb)
		}
	], function (error, data) {
		if (error) {
			req.error = error
			return next()
		}
		return next()
	})
}

//	Contact
module.exports.contact = function(req, res, next) {

	if(!req.body.email || !req.body.email.length || !req.body.message || !req.body.message.length) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var email = req.body.email || null
	var message = req.body.message || null

	if(!validate.email(email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	async.series([
		//	Insert into database
		function isertIntoDatabase (cb) {
			Query('INSERT INTO contact (email, message, createdAt) VALUES (?, ?, ?)', [email, message, date.toMysql(new Date())])
			.then(function () {
				cb()
			})
			.catch(cb)
		},
		//	Send e-mail to us
		function mailUs (cb) {

			var html = '<img style="margin-bottom: 20px;" src="http://i.imgur.com/eWEE4zI.png" alt="Sample Cleaner">' +
						'<div style="font-family:Arial; font-size:15px; margin-bottom: 8px;"><b>Remitente</b>: ' + email + '</div>' +
						'<div style="font-family:Arial; font-size:15px; margin-bottom: 20px;"><b>Fecha</b>: ' + date.toMysql(new Date()) + '</div>' +
						'<hr style="color: #ddd">' +
						'<div style="font-family:Arial; font-size:15px; margin-top: 20px;"><b>Consulta</b>: ' + message + '</div>'

			var mailOptions = {
				from: email,
				to: config.EMAIL_USER,
				subject: 'Contacto web: ' + email,
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
