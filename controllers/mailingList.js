//	Requirements
var async 		= require('async')
var locals 		= require('locals')
var crypt 		= require('../tools/crypt')
var date 		= require('../tools/dates')
var validate 	= require('../tools/validate')

//	Join mailing list
module.exports.enter = function(req, res, next) {

	if(!req.body.email || !req.body.email.length) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var email = req.body.email || null

	if(!validate.email(email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	var token = crypt.backend(email)
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
					Query('INSERT INTO mailing_list (email, createdAt, token, disabled) VALUES (?, ?, ?, ?)', [email, date.toMysql(new Date()), token, 0])
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
module.exports.quit = function(req, res, next) {

	if(!req.body.email || !req.body.email.length || !req.body.token || !req.body.token.length) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var email = req.body.email || null
	var token = req.body.token || null

	if(!validate.email(email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	async.series([
		//	Check if it's on the list
		function checkIfExists (cb) {
			Query('SELECT email, token FROM mailing_list WHERE email LIKE ?', [email])
			.then(function (rows) {
				if(!rows[0].length) {
					return cb(Errores.NO_EN_LA_LISTA)
				}
				if(rows[0][0].token != token) {
					return cb(Errores.TOKEN_INCORRECTO)
				}
				cb()
			})
			.catch(cb)
		},
		//	Disable email
		function quitMailinglist (cb) {
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

//	Quit mailing list with token as URL param (for method GET)
module.exports.quit_token = function(req, res, next) {

	if(!req.params.email || !req.params.email.length || !req.params.token || !req.params.token.length) {
		req.error = res.locals.error = Errores.NO_PARAMS
		return next()
	}

	var token = req.params.token || null
	var email = req.params.email || null

	if(!validate.email(email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	async.series([
		//	Check if it's on the list
		function checkIfExists (cb) {
			Query('SELECT email, token FROM mailing_list WHERE email LIKE ?', [email])
			.then(function (rows) {
				if(!rows[0].length) {
					return cb(Errores.NO_EN_LA_LISTA)
				}
				if(rows[0][0].token != token) {
					return cb(Errores.TOKEN_INCORRECTO)
				}
				cb()
			})
			.catch(cb)
		},
		//	Disable email
		function quitMailinglist (cb) {
			Query('UPDATE mailing_list SET disabled = ? WHERE email LIKE ?', [1, email])
			.then(function () {
				cb()
			})
			.catch(cb)
		}
	], function (error, data) {
		if (error) {
			req.error = res.locals.error = error
			return next()
		}
		res.locals.error = null
		res.locals.email = email
		return next()
	})
}
