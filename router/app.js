//	Requirements
var controllers = require('../controllers')
var api 		= require('../api')

module.exports = function(app) {
	//	Autentication
	app.get('/', controllers.render('index'))
	//	Quit mailing list:
	app.get('/list/quit/:email/:token', api.auth.require.not_logged, controllers.mailingList.quit_token, controllers.render('misc/quit-list', { layout : 'layout-misc' }))
}