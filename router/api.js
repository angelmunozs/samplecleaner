//	Requirements
var controllers = require('../controllers')
var api 		= require('../api')

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
	app.get('/api/list/quit/:email/:token', api.auth.require.not_logged, controllers.mailingList.quit_token, api.common.generic)
	//	Contact
	app.post('/api/contact', controllers.contact.send, api.common.generic)
	//	Get noise profiles
	app.get('/api/noise/samples', controllers.noise.samples, api.common.data)
	app.get('/api/noise/profiles', controllers.noise.profiles, api.common.data)
	//	Get info from year and profile
	app.get('/api/info/year/:year', controllers.noise.info_year, api.common.data)
	app.get('/api/info/profile/:year/:profile', controllers.noise.info_profile, api.common.data)
	//	Get wav file for preview of noise samples
	app.get('/api/noise/:extension/:year/:profile', controllers.noise.audio, api.common.file)
	//	Clean a song
	app.post('/api/clean', controllers.files.delete_old, controllers.files.upload, controllers.files.clean, api.common.data)
	//	Download a song
	app.get('/api/song/:id', controllers.files.delete_old, controllers.files.download, api.common.file)
}