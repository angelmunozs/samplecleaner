// Comprueba que no hay campos vacíos en un objeto
module.exports.emptyFields = function (object) {
	for (var j in object)
		if(object[j] === undefined || object[j] === null || object[j] === '') return true
	return false
}

// Pasando como parámetro 'req.params', comprueba que son todos numéricos y no nulos
module.exports.numericParams = function (params) {
	for (var j in params)
		if(!params[j] || !params[j].length || isNaN(params[j]))
			return false
	return true
}