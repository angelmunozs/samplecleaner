//	Requirements
var PythonShell = require('python-shell')
var formidable 	= require('formidable')
var async 		= require('async')
var path 		= require('path')
var fs 			= require('fs.extra')
var _ 			= require('underscore')
var validate 	= require('../tools/validate')
var date 		= require('../tools/dates')

//	Default path for Python scripts
PythonShell.defaultOptions = { scriptPath: path.join(__dirname, '../scripts/python') }

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

		//	console.log('error: %s', error)
		//	console.log('data: %s', JSON.stringify(data))
		//	console.log('files: %s', JSON.stringify(files))

		if(_.isEmpty(files)) {
			req.error = Errores.NO_FILE_UPLOADED
			return next()
		}

		if(!data.noiseYear || !data.noiseProfile || !data.reduceGain || !data.smoothingBands) {
			req.error = Errores.NO_PARAMS
			return next()
		}

		var file 			= files.file
		var type 			= file.type
		var size 			= file.size
		var name 			= file.name
		var extension 		= '.' + name.split('.').pop()
		var idUser 			= req.user ? req.user.idUser : null
		var noiseYear 		= data.noiseYear || null
		var noiseProfile 	= data.noiseProfile || null
		var reduceGain 		= data.reduceGain || null
		var smoothingBands 	= data.smoothingBands || null

		if(!/[4-9]{1,1}[0]{1,1}/.test(noiseYear) || !/[1-9]{1,2}/.test(noiseProfile) || !(reduceGain >= 10 && reduceGain <= 40) || !/[0-5]{1,1}/.test(smoothingBands)) {
			req.error = Errores.CAMPOS_INCORRECTOS
			return next()
		}

		var newFileDestination, insertId
		var params = {
			noiseYear: noiseYear,
			noiseProfile: noiseProfile,
			reduceGain: reduceGain,
			smoothingBands: smoothingBands
		}

		if(!validate.audio(type, extension)) {
			req.error = Errores.WRONG_FILE_TYPE
			return next()
		}

		async.series([
			//	Update entry in DB
			function logUpload(cb) {
				var sql = 'INSERT INTO log_uploads (idUser, ip, date, error, messages, name, size, type, params) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
				Query(sql, [idUser, req.ip, date.toMysql(new Date()), null, null, name, size, type, JSON.stringify(params)])
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
			req.noiseYear 		= noiseYear
			req.noiseProfile 	= noiseProfile
			req.reduceGain 		= reduceGain
			req.smoothingBands 	= smoothingBands
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

//	Clean a sample
module.exports.clean = function(req, res, next) {

	if(!req.file || _.isEmpty(req.file)) {
		return next()
	}

	if(!req.noiseYear || !req.noiseYear.length || !req.noiseProfile || !req.noiseProfile.length || !req.reduceGain || !req.reduceGain.length || !req.smoothingBands || !req.smoothingBands.length) {
		req.error = Errores.CAMPOS_VACIOS
		return next()
	}

	var noiseYear = req.noiseYear || null
	var noiseProfile = req.noiseProfile || null
	var reduceGain = req.reduceGain || null
	var smoothingBands = req.smoothingBands || null

	req.data = {
		id 			: req.file.id,
		url 		: req.file.url,
		name 		: req.file.name,
		extension 	: req.file.extension,
		type 		: req.file.type,
		size 		: req.file.size
	}

	var messages = []
	var startTime, endTime

	async.waterfall([
		function cleanSong(cb) {
			//	Time measure
			startTime = new Date().getTime()
			//	Python shell init
			var pyshell = new PythonShell('clean.py', {
				args : [
					req.file.url, 	/* Dirty file path */
					noiseYear, 		/* Noise year */
					noiseProfile, 	/* Noise profile */
					reduceGain, 	/* Reduce gain */
					smoothingBands 	/* Smoothing bands */
					]
			})
			.on('message', function (message) {
				messages.push(message)
			})
			.end(function (error) {
				messages = messages.join('\n')
				//	Depends on the message shown by the Pyhton console!!
				req.data.url = messages.split('Saved as ')[1]
				//	Update file name
				req.data.name = req.data.name.split('.')[0] + '.' + path.extname(req.data.url)
				cb(null, error)
			})
		},
		function logError(error, cb) {
			//	Time measure
			endTime = new Date().getTime()
			var time = endTime - startTime

			var sql = 'UPDATE log_uploads SET error = ?, messages = ?, time = ? WHERE idLog = ?'
			Query(sql, [JSON.stringify(error), messages, time, req.file.id])
			.then(function () {
				cb(error)
			})
			.catch(cb)
		}
	], function (error) {
		if(error) {
			req.error = error
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
					url 	: rows[0][0].messages.split('Saved as ')[1], 	/*	Depends on the message shown by the Pyhton console!! 	*/
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