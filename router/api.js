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
	app.post('/api/list/enter', api.auth.require.not_logged, controllers.mailingList.enter, api.common.generic)
	app.post('/api/list/quit', api.auth.require.not_logged, controllers.mailingList.quit, api.common.generic)
	//	Contact
	app.post('/api/contact', controllers.contact.send, api.common.generic)
}