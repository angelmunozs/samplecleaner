//	Requirements
var _ 			= require('underscore')
var async 		= require('async')
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
module.exports.mailingList = function(req, res, next) {

	if(!req.params.email || !req.params.email.length) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var email = req.params.email || null

	if(!validate.email(email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	async.series([
		//	Check if it has already been inserted
		function checkIfExists (cb) {
			Query('SELECT email FROM mailing_list WHERE email LIKE ?', [email])
			.then(function (rows) {
				if(rows[0].length) {
					return cb(Errores.YA_EN_LA_LISTA)
				}
				cb()
			})
			.catch(cb)
		},
		//	Insert new email
		function joinMailinglist (cb) {
			Query('INSERT INTO mailing_list (email, createdAt, disabled) VALUES (?, ?, ?)', [email, date.toMysql(new Date()), 0])
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