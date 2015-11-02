module.exports = {
	//	Datos inaccesibles
	NO_RESULTADOS : 				{ code : 100, message : 'No se han encontrado resultados' },
	PARAMETROS_INCORRECTOS : 		{ code : 101, message : 'Los parámetros tienen formato incorrecto' },
	CATEGORIA_INCORRECTA : 			{ code : 102, message : 'No existe la categoría especificada' },
	CAMPOS_VACIOS : 				{ code : 103, message : 'Campos vacíos' },
	CUERPO_VACIO : 					{ code : 104, message : 'El cuerpo de la petición está vacío' },
	NO_EXISTE_EVENTO : 				{ code : 105, message : 'El evento no existe' },
	CAMPOS_INCORRECTOS : 			{ code : 106, message : 'Campos incorrectos' },
	PASSWORD_FORMATO_INCORRECTO : 	{ code : 107, message : 'El formato de la contraseña es incorrecto' },
	//	Error en la petición
	PUNTO_ACCESO_DESCONOCIDO : 		{ code : 200, message : 'Punto de acceso desconocido' },
	SINTAXIS_INCORRECTA : 			{ code : 201, message : 'Sintaxis de datos incorrecta' },
	//	Errores de autenticación
	USUARIO_NO_VALIDO : 			{ code : 300, message : 'Usuario no encontrado' },
	PASSWORD_INCORRECTO : 			{ code : 301, message : 'Contraseña incorrecta' },
	ACCESO_DENEGADO : 				{ code : 302, message : 'Acceso denegado' },
	USUARIO_BLOQUEADO : 			{ code : 303, message : 'Tienes prohibido el acceso' },
	USUARIO_LOGEADO : 				{ code : 304, message : 'No puedes realizar esta acción estando logeado' },
	USUARIO_NO_LOGEADO : 			{ code : 305, message : 'No hay ningún usuario logeado' },
	ERROR_LOGIN : 					{ code : 306, message : 'Ha habido un error en el proceso de login' },
	NO_PROPIETARIO : 				{ code : 307, message : 'No eres el propietario de este evento' },
	USUARIO_EXISTE : 				{ code : 308, message : 'Ya existe un usuario con ese email' },
	//	Datos bloqueados
	EVENTO_BLOQUEADO : 				{ code : 400, message : 'Evento no disponible' }
}