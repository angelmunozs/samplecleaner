//	Requirements
var _ 		= require('underscore')
var async 	= require('async')
var site 	= require('../controllers')
var crypt 	= require('../tools/crypt')
var date 	= require('../tools/dates')
var utils 	= require('../tools/utils')

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