//	Requirements
var controllers = require('../controllers')
var api 		= require('../api')
var render 		= require('../render')

module.exports = function(app) {
	//	Autenticación
	app.post('/api/login', controllers.auth.login, api.common.generic)
	app.post('/api/logout', controllers.auth.logout, api.common.generic)
	app.get('/api/user', api.users.info)
	//	Usuario
	app.post('/api/user', api.auth.require.not_logged, controllers.users.create, api.common.generic)
	//	Mailing list
	app.get('/api/list/enter/:email', api.auth.require.not_logged, controllers.users.enterMailingList, api.common.generic)
	app.get('/api/list/quit/:email', api.auth.require.not_logged, controllers.users.quitMailingList, api.common.generic)
	//	Contact
	//	app.get('/api/contact', controllers.users.contact, api.common.generic)
}