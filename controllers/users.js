//	Requirements
var _ 			= require('underscore')
var async 		= require('async')
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
		name : req.body.name || null
	}

	if(utils.emptyFields(user)) {
		req.error = Errores.CAMPOS_VACIOS
		return next()
	}

	if(!validate.email(user.email)) {
		req.error = Errores.EMAIL_INCORRECTO
		return next()
	}

	user.hash = crypt.backend(user.email + user.password);

	if(user.hash.length != 30) {
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
			Query("INSERT INTO users (email, password, name, createdAt, disabled) VALUES (?, ?, ?, ?, ?)", [user.email, user.hash, user.name, date.toMysql(new Date()), 0])
			.then(function(rows) {
				user.idUser = rows[0].insertId
				cb()
			})
			.catch(cb)
		},
		//	Asigna el grupo de usuario básico
		function assignGroup(cb) {
			Query("SELECT idGroup FROM groups WHERE `group` LIKE ?", ['basic'])
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
