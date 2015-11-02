//  Requirements
var api = require('../api')
var errores = require('../tools/errores')

//	Genérica
module.exports.auth = function(req, res) {
    if(req.error)
        return res.api.error(req.error)

    res.api.ok()
}

//  Authentication Requirements
module.exports.require = {
    user : function(req, res, next) {
        if(req.user) {
            return next()
        }
        return res.api.error(Errores.ACCESO_DENEGADO)
    },
    admin : function(req, res, next) {
        if(req.user && req.user.groups.indexOf('admin') != -1) {
            return next()
        }
        return res.api.error(Errores.ACCESO_DENEGADO)
    },
    propietario : function(req, res, next) {
        if(!req.evento) {
            return res.api.error(Errores.NO_EXISTE_EVENTO)
        }
        if(req.evento.idUser == req.user.id) {
            return next()
        }
        return res.api.error(Errores.NO_PROPIETARIO)
    },
    not_logged : function(req, res, next) {
        if(!req.user) {
            return next()
        }
        return res.api.error(Errores.USUARIO_LOGEADO)
    }
}