//	Requirements
var Sequelize 	= require('sequelize')
var path 		= require('path')
var config 		= require('../config')
var glob 		= require('glob')
var locals 		= require('locals')
var _ 			= require('underscore')

//  Global variables
global.Errores = require('../tools/errores')
global.Mensajes = require('../tools/mensajes')

//	Export controllers
module.exports = {}
var files = glob.sync(path.join(__dirname, '*.js'))
files.forEach(function(file) {
	name = path.basename(file, '.js')
	if(name != 'index')
		module.exports[name] = require(file)
})

//	Global variables
global.config = config
global.locals = locals

//	Global functions
module.exports.render = function(page, data, layout) {
	return function (req, res) {
		//	Default layout
		data = data ? data : {}
		data.layout = data.layout ? data.layout : 'layout-main'
		//	Render page
		res.render(page, data, layout ? layout : false);
	}
}

//	Pre render
module.exports.prerender = function(req, res, next) {
	//	Locals
	res.locals.base_title 	= config.BASE_TITLE
	res.locals.page_title 	= req.page_title || config.PAGE_TITLE_DEFAULT
	res.locals.lang 		= config.DEFAULT_LANG
    res.locals.path 		= req.path
    res.locals.user 		= req.user || null
    //	Jump to next step in chain
	next()
}