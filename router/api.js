//	Requirements
var controllers = require('../controllers')
var api 		= require('../api')
var render 		= require('../render')

module.exports = function(app) {
	//	Autenticación
	app.post('/api/login', controllers.auth.login, api.auth.auth)
	app.post('/api/logout', controllers.auth.logout, api.auth.auth)
	app.get('/api/user', api.users.info)
	//	Usuario
	app.post('/api/user', api.auth.require.not_logged, controllers.users.create, api.users.create)
}