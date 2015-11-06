//  Requirements
var api = require('../api')

//	Obtener user logeado
module.exports.info = function(req, res) {
    if(!req.user)
        return res.api.error(Errores.USUARIO_NO_LOGEADO)

    res.api.ok(req.user)
}