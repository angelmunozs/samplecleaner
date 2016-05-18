//	Requirements
var path 		= require('path')
var async 		= require('async')
var validate 	= require('../tools/validate')
var date 		= require('../tools/dates')
var site 		= require('../controllers')

//	Retrieve info from table
module.exports.table = function(req, res, next) {

	if(!req.params.table) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var table = req.params.table

	Query('SELECT * FROM ' + table, [])
	.then(function (rows) {
		req.data = rows[0]
		return next()
	})
	.catch(function (error) {
		req.error = error
		return next()
	})
}

//	Get info from log_uploads
module.exports.uploads = function(req, res, next) {

	var limit = Number(req.params.limit) || 5
	var offset = Number(req.params.offset) || 0
	var type = req.params.type || null

	res.locals.limit = limit
	res.locals.offset = offset
	res.locals.type = type

	res.locals.user = req.user
	res.locals.uploads = null

	var sql1 = 'SELECT * FROM log_uploads'
	var sql2 = 'SELECT COUNT(*) AS total FROM log_uploads'
	if(type == 'incomplete') {
		sql1 += ' WHERE error IS NOT NULL'
		sql2 += ' WHERE error IS NOT NULL'
	}
	else if(type == 'complete') {
		sql1 += ' WHERE error IS NULL'
		sql2 += ' WHERE error IS NULL'
	}
	sql1 += ' ORDER BY idLog DESC LIMIT ? OFFSET ?'

	async.series([
		function findSome (cb) {
			Query(sql1, [limit, offset])
			.then(function (rows) {
				res.locals.uploads = rows[0]
				cb()
			})
			.catch(cb)
		},
		function findAll (cb) {
			Query(sql2, [])
			.then(function (rows) {
				res.locals.total = rows[0][0].total
				cb()
			})
			.catch(cb)
		}
	], function (error) {
		if(error) {
			site.renderError(500, req, res)
		}
		return next()
	})
}
//	Get info from contact
module.exports.messages = function(req, res, next) {

	var limit = Number(req.params.limit) || 6
	var offset = Number(req.params.offset) || 0
	var type = req.params.type || null

	res.locals.limit = limit
	res.locals.offset = offset
	res.locals.type = type

	res.locals.user = req.user
	res.locals.messages = null

	var sql1 = 'SELECT * FROM contact'
	var sql2 = 'SELECT COUNT(*) AS total FROM contact'
	if(type == 'web') {
		sql1 += ' WHERE type LIKE "Contacto web"'
		sql2 += ' WHERE type LIKE "Contacto web"'
	}
	else if(type == 'uploads') {
		sql1 += ' WHERE type LIKE "Proceso fallido"'
		sql2 += ' WHERE type LIKE "Proceso fallido"'
	}
	sql1 += ' ORDER BY idContact DESC LIMIT ? OFFSET ?'

	async.series([
		function findSome (cb) {
			Query(sql1, [limit, offset])
			.then(function (rows) {
				res.locals.messages = rows[0]
				cb()
			})
			.catch(cb)
		},
		function findAll (cb) {
			Query(sql2, [])
			.then(function (rows) {
				res.locals.total = rows[0][0].total
				cb()
			})
			.catch(cb)
		}
	], function (error) {
		if(error) {
			site.renderError(500, req, res)
		}
		return next()
	})
}
//	Get info from templates
module.exports.templates = function(req, res, next) {

	res.locals.templates = []
	res.locals.user = req.user

	var sql = 'SELECT * FROM templates'
	
	Query(sql, [])
	.then(function (rows) {
		res.locals.templates = rows[0]
		return next()
	})
	.catch(function (error) {
		site.renderError(500, req, res)
	})
}
