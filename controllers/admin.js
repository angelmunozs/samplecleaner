//	Requirements
var path 		= require('path')
var validate 	= require('../tools/validate')
var date 		= require('../tools/dates')

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
