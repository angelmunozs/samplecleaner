//	Requirements
var glob = require('glob')
var path = require('path')
var Errores = require('../tools/errores')

//	Export api
module.exports = {}
var files = glob.sync(path.join(__dirname, '*.js'))
files.forEach(function(file) {
	name = path.basename(file, '.js')
	if(name != 'index')
		module.exports[name] = require(file)
})

//	Envío de JSON de consulta correcta
var api_ok = function(res) {
    return function(data) {
        return res.json({
            code: 0,
            data: data
        })
    }
}
//	Envío de JSON de consulta errónea
var api_err = function(res) {
    return function(err, code) {
        var e = err

        if (err instanceof Error) {
            e = err.name + ':' + err.message
            console.log(e.stack)
        }

        if (err && err.code && err.message) {
            code = err.code
            e = err.message
        }
        return res.json({
            code: code || 1,
            error: e
        })
    }
}
//  Inicializacion de variables en req y res
module.exports.init = function(req, res, next) {
    res.api = {}
    // Funcion de respuesta correcta de api
    res.api.ok = api_ok(res)
    // Funcion de respuesta erronea de api
    res.api.error = api_err(res)

    next()
}
//  Error handler
module.exports.error = function(err, req, res, next) {
    if (err) {
        console.error("Body: " + err.body)
        console.error("Stack: " + err.stack)
        return api_err(res)(Errores.SINTAXIS_INCORRECTA)
    }
    else
        next()
}
//  Default fallback
module.exports.fallback = function(req, res) {
    res.api.error(Errores.PUNTO_ACCESO_DESCONOCIDO)
}