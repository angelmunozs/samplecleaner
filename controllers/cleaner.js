//	Requirements
var async 		= require('async')
var path 		= require('path')
var fs 			= require('fs.extra')
var _ 			= require('underscore')

//	Upload file to server
//	Uploaded file name: A numeric id, starting from 1
module.exports.upload = function(req, res, next) {

	var dirtyFilesLocation = path.join(__dirname, '../files/songs/dirty')

	if(!req.body.file) {
		req.error = Errores.NO_FILE_UPLOADED
		return next()
	}

	var file = req.body.file || null

	var newFileName
	var newFileDestination
	var extension = '.' + file.split('.').pop()

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
			newFileDestination = path.join(dirtyFilesLocation, newFileName + extension)
			fs.writeFile(newFileDestination, file, cb)
		}
	], function (error) {
		if (error) {
			req.error = error
			return next()
		}
		req.file = newFileDestination
		return next()
	})
}

//	Convert to WAV
module.exports.convert = function(req, res, next) {
	if(!req.file) {
		return next()
	}

	//	TODO
	setTimeout(function(){ return next() }, 2000);
}

//	Clean a sample
module.exports.clean = function(req, res, next) {
	if(!req.file) {
		return next()
	}

	//	TODO

	var cleanFilesLocation = path.join(__dirname, '../files/songs/clean')
	var dirtyFile = req.file
	var parts = dirtyFile.split(path.sep)
	var rawFileName = parts[parts.length - 1]
	var newFileDestination = path.join(cleanFilesLocation, rawFileName)

	fs.copy(dirtyFile, newFileDestination, {}, function (error) {
		if (error) {
			req.error = error
			return next()
		}
		req.data = rawFileName
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