//	Requirements
var formidable 	= require('formidable')
var async 		= require('async')
var path 		= require('path')
var fs 			= require('fs.extra')
var _ 			= require('underscore')
var validate 	= require('../tools/validate')

//	Upload file to server
//	Uploaded file name: A numeric id, starting from 1
module.exports.upload = function(req, res, next) {

	var form = new formidable.IncomingForm()

	form.parse(req, function (err, data, files) {

		var dirtyFilesLocation = path.join(__dirname, '../files/songs/dirty')

		if(_.isEmpty(files)) {
			req.error = Errores.NO_FILE_UPLOADED
			return next()
		}

		var file 		= files.file
		var type 		= file.type
		var size 		= file.size
		var name 		= file.name
		var extension 	= '.' + name.split('.').pop()

		var newFileName, newFileDestination

		if(!validate.audio(type, extension)) {
			req.error = Errores.WRONG_FILE_TYPE
			return next()
		}

		async.series([
			//	Find id of the last uploaded file
			function findLastId(cb) {
				var files = fs.readdirSync(dirtyFilesLocation)
				//	Take only the numbers, not the extensions
				for(var i in files) {
					files[i] = Number(files[i].split('.')[0])
				}
				//	Order the numbers correctly, not alphabetically
				function sortNumber(a, b) {
					return a - b
				}
				files.sort(sortNumber)
				//	Take the last one
				var lastId = files.length ? Number(files[files.length - 1]) : 0
				newFileName = lastId + 1
				cb()
			},
			//	Upload file
			function uploadFile(cb) {
				fs.readFile(file.path, function (error, data) {
					if(error) {
						cb(error)
					}
					newFileDestination = path.join(dirtyFilesLocation, newFileName + extension)
					fs.writeFile(newFileDestination, data, cb)
				})
			}
		], function (error) {
			if (error) {
				req.error = error
				return next()
			}
			req.file = {
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
	
	if(!req.file) {
		return next()
	}

	//	TODO: 	Convert to WAV, if not a WAV file
	//			(Python script)
}

//	Clean a sample
module.exports.clean = function(req, res, next) {

	if(!req.file) {
		return next()
	}

	//	TODO: 	Clean the file
	//			(Python script)

	var cleanFilesLocation = path.join(__dirname, '../files/songs/clean')
	var newFileDestination = path.join(cleanFilesLocation, req.file.name)

	fs.copy(req.file.url, newFileDestination, {}, function (error) {
		if (error) {
			req.error = error
			return next()
		}
		req.data = req.file.name
		return next()
	})
}

//	Download the clean song
module.exports.download = function(req, res, next) {

	if(!req.params.name) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var name = req.params.name || null
	var location = path.join(__dirname, '../files/songs/clean', name)

	fs.readFile(location, function (error, data) {
		if(error) {
			req.error = error
		}
		if(!data || !data.length) {
			req.error = Errores.NO_FILE_FOUND
		}
		req.file = location
		return next()
	})
}