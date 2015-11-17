//	Requirements
var formidable 	= require('formidable')
var async 		= require('async')
var path 		= require('path')
var fs 			= require('fs.extra')
var _ 			= require('underscore')
var validate 	= require('../tools/validate')
var date 		= require('../tools/dates')

//	Upload file to server
//	Uploaded file name: A numeric id, starting from 1
module.exports.upload = function(req, res, next) {

	var form = new formidable.IncomingForm()

	form.parse(req, function (error, data, files) {

		if(error) {
			req.error = error
			return next()
		}

		var dirtyFilesLocation = path.join(__dirname, '../files/songs/dirty')

		// console.log('error: %s', error)
		// console.log('data: %s', JSON.stringify(data))
		// console.log('files: %s', JSON.stringify(files))

		if(_.isEmpty(files)) {
			req.error = Errores.NO_FILE_UPLOADED
			return next()
		}

		var file 		= files.file
		var type 		= file.type
		var size 		= file.size
		var name 		= file.name
		var extension 	= '.' + name.split('.').pop()
		var idUser 		= req.user ? req.user.idUser : null

		var newFileDestination, insertId

		if(!validate.audio(type, extension)) {
			req.error = Errores.WRONG_FILE_TYPE
			return next()
		}

		async.series([
			//	Update entry in DB
			function logUpload(cb) {
				var sql = 'INSERT INTO log_uploads (idUser, ip, date, name, size, type) VALUES (?, ?, ?, ?, ?, ?)'
				Query(sql, [idUser, req.ip, date.toMysql(new Date()), name, size, type])
				.then(function (rows) {
					insertId = rows[0].insertId
					cb()
				})
				.catch(cb)
			},
			//	Upload file
			function uploadFile(cb) {
				fs.readFile(file.path, function (error, data) {
					if(error) {
						cb(error)
					}
					newFileDestination = path.join(dirtyFilesLocation, insertId + extension)
					fs.writeFile(newFileDestination, data, cb)
				})
			},
			//	Update URL in DB
		], function (error) {
			if (error) {
				req.error = error
				return next()
			}
			req.file = {
				id 			: insertId,
				url 		: newFileDestination,
				name 		: name,
				extension 	: extension,
				type 		: type,
				size 		: size
			}
			return next()
		})
	})
}

//	Convert to WAV
module.exports.convert = function(req, res, next) {

	if(!req.file || _.isEmpty(req.file)) {
		return next()
	}

	//	TODO: 	Convert to WAV, if not a WAV file
	//			(Python script)

	return next()
}

//	Clean a sample
module.exports.clean = function(req, res, next) {

	if(!req.file || _.isEmpty(req.file)) {
		return next()
	}

	//	TODO: 	Clean the file
	//			(Python script)

	//	Convert to string, for path.join to work fine
	if(typeof req.file.id != 'string') {
		req.file.id = req.file.id.toString()
	}

	var cleanFilesLocation = path.join(__dirname, '../files/songs/clean')
	var newFileDestination = path.join(cleanFilesLocation, req.file.id + req.file.extension)

	fs.copy(req.file.url, newFileDestination, {}, function (error) {
		if (error) {
			req.error = error
			return next()
		}
		req.data = {
			id 			: req.file.id,
			url 		: req.file.url,
			name 		: req.file.name,
			extension 	: req.file.extension,
			type 		: req.file.type,
			size 		: req.file.size
		}
		return next()
	})
}

//	Download the clean song
module.exports.download = function(req, res, next) {

	if(!req.params.id) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var id = req.params.id || null

	var file

	async.series([
		function fileData(cb) {
			Query('SELECT * FROM log_uploads WHERE idLog = ?', [id])
			.then(function (rows) {
				if(!rows[0].length) {
					return cb(Errores.NO_FILE_FOUND)
				}
				file = {
					id 		: id,
					url 	: path.join(__dirname, '../files/songs/clean', id + '.' + rows[0][0].name.split('.')[1]) /* Change when WAV conversion works */,
					name 	: rows[0][0].name,
					ip 		: rows[0][0].ip
				}
				if(file.ip != req.ip) {
					return cb(Errores.DOWNLOAD_FORBIDDEN)
				}
				cb()
			})
			.catch(cb)
		},
		function findFile(cb) {
			fs.readFile(file.url, function (error, data) {
				if(error) {
					return cb(error)
				}
				if(!data || !data.length) {
					return cb(Errores.NO_FILE_FOUND)
				}
				cb()
			})
		}
	], function (error) {
		if(error) {
			req.error = error
			return next()
		}
		req.file = file.url
		return next()
	})
}