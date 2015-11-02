//	Requirements
var controllers = require('../controllers')
var api 		= require('../api')
var render 		= require('../render')

module.exports = function(app) {
	//	Autenticación
	app.get('/', controllers.render('index'))
}