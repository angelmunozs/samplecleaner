//	Requirements
var controllers = require('../controllers')
var api 		= require('../api')

module.exports = function(app) {
	//	Autentication
	app.get('/', controllers.render('index'))
	//	Quit mailing list:
	app.get('/list/quit/:email/:token', controllers.mailingList.quit_token, controllers.render('misc/quit-list', { layout : 'layout-misc' }))
	//	Login form
	app.get('/login', controllers.render('login', { layout : 'layout-auth' }))
	//	Admin panel
	app.get('/admin', controllers.auth.require.admin, controllers.admin.uploads, controllers.render('admin/uploads', { layout : 'layout-admin' }))
	app.get('/admin/uploads/:type?/:limit?/:offset?', controllers.auth.require.admin, controllers.admin.uploads, controllers.render('admin/uploads', { layout : 'layout-admin' }))
	app.get('/admin/contact/:type?/:limit?/:offset?', controllers.auth.require.admin, controllers.admin.messages, controllers.render('admin/messages', { layout : 'layout-admin' }))
	app.get('/admin/templates/edit', controllers.auth.require.admin, controllers.admin.templates, controllers.render('admin/templates', { layout : 'layout-admin' }))
	app.get('/admin/templates/add', controllers.auth.require.admin, controllers.admin.templates, controllers.render('admin/templates', { layout : 'layout-admin' }))
}