//	Marcar notificación como hecha
module.exports.hecho = function(req, res, next) {

	if(!req.params.id || isNaN(req.params.id)) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var id_notification = req.params.id || null

	Query('UPDATE huerto.notifications SET active = 0 WHERE id_notification = ?', [id_notification])
	.then(function (rows) {
        return res.json({
            code: 0
        })
	})
	.catch(function (error) {
        return res.json({
            code: 1,
            error: error
        })
	})
}
