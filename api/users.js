//  Requirements
var api = require('../api')

//  Generic response
module.exports.generic = function(req, res) {
    if(req.error)
        return res.api.error(req.error)

    res.api.ok()
}

//	Obtener user logeado
module.exports.info = function(req, res) {
    if(!req.user)
        return res.api.error(Errores.USUARIO_NO_LOGEADO)

    res.api.ok(req.user)
}