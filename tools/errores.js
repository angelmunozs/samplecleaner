module.exports = {
	//	Datos inaccesibles
	NO_RESULTADOS : 				{ code : 100, message : 'No results found' },
	PARAMETROS_INCORRECTOS : 		{ code : 101, message : 'Incorrect parameters' },
	CAMPOS_VACIOS : 				{ code : 102, message : 'Empty fields' },
	CUERPO_VACIO : 					{ code : 103, message : 'Empty body' },
	CAMPOS_INCORRECTOS : 			{ code : 104, message : 'Wrong fields' },
	PASSWORD_FORMATO_INCORRECTO : 	{ code : 105, message : 'Wrong format of password' },
	NO_PARAMS : 					{ code : 106, message : 'Empty parameters' },
	NO_FILE_FOUND : 				{ code : 107, message : 'File not found' },
	NO_FILE_UPLOADED : 				{ code : 108, message : 'No file selected' },
	NO_FILE_UPLOADED : 				{ code : 109, message : 'Wrong file type' },
	//	Error en la petición
	PUNTO_ACCESO_DESCONOCIDO : 		{ code : 200, message : 'Unknown access point' },
	SINTAXIS_INCORRECTA : 			{ code : 201, message : 'Wrong syntax' },
	//	Errores de autenticación
	USUARIO_NO_VALIDO : 			{ code : 300, message : 'The user doens\'t exist' },
	PASSWORD_INCORRECTO : 			{ code : 301, message : 'Wrong password' },
	ACCESO_DENEGADO : 				{ code : 302, message : 'Denied access' },
	USUARIO_BLOQUEADO : 			{ code : 303, message : 'Access forbidden' },
	USUARIO_LOGEADO : 				{ code : 304, message : 'You must not be logged' },
	USUARIO_NO_LOGEADO : 			{ code : 305, message : 'You must be logged' },
	ERROR_LOGIN : 					{ code : 306, message : 'Login error' },
	USUARIO_EXISTE : 				{ code : 307, message : 'User already exists' },
	YA_EN_LA_LISTA : 				{ code : 308, message : 'E-mail already on the list' },
	NO_EN_LA_LISTA : 				{ code : 309, message : 'E-mail not on the list' },
	EMAIL_INCORRECTO : 				{ code : 310, message : 'Incorrect e-mail' },
	TOKEN_INCORRECTO : 				{ code : 311, message : 'Incorrect token' }
}