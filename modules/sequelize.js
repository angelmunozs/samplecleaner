//	Requirements
var mysql = require('mysql')
var Sequelize = require('sequelize')

exports.name = "Sequelize"
exports.order  = 2

exports.load = function(cb) {
	//	Database
	global.DB = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
		dialect: config.DB_DIALECT,
		logging: console.log
	})
	global.Query = function (sql, params) {
		return DB.query(sql, null, {raw: true,  replacements: params})
	}
	//	Evitar inyección de sql
	global.sanitizeSQL = function(value) {
	    return mysql
	            .escape(value)
	            //	Comillas al inicio de la consulta
	            .replace(/^\'/g, '')
	            //	Carácter '?' al inicio de la consulta
	            .replace(/\?/gi, '')
	            //	Comillas al final de la consulta
	            .replace(/\'$/g, '');
	}
	cb()
}