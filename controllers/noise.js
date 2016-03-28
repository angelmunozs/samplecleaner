//	Requirements
var async 		= require('async')
var path 		= require('path')
var fs 			= require('fs')
var _ 			= require('underscore')

//	Get info of noise samples
module.exports.samples = function(req, res, next) {

	var location = path.join(__dirname, '..', 'files', 'noise', 'audio')
	var subdirectories = fs.readdirSync(location)
	var samples = {}

	async.each(subdirectories, function (year, cb) {
		fs.readdir(path.join(location, year), function (error, files) {
			if(error) {
				return cb(error)
			}
			samples[year] = files
			cb()
		})
	}, function (error) {
		if(error) {
			req.error = error
			return next()
		}
		req.data = samples
		return next()
	})
}
//	Get info of noise profiles
module.exports.profiles = function(req, res, next) {

	var location = path.join(__dirname, '..', 'files', 'noise', 'profiles')
	var subdirectories = fs.readdirSync(location)
	var samples = {}

	async.each(subdirectories, function (year, cb) {
		fs.readdir(path.join(location, year), function (error, files) {
			if(error) {
				return cb(error)
			}
			samples[year] = files
			cb()
		})
	}, function (error) {
		if(error) {
			req.error = error
			return next()
		}
		req.data = samples
		return next()
	})
}
//	Get info of a specific year
module.exports.info_year = function(req, res, next) {

	var allowedYears = ['40', '50', '60', '70', '80', '90']

	if(!req.params.year) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var year = req.params.year || null

	if(allowedYears.indexOf(year) == -1) {
		req.error = Errores.PARAMETROS_INCORRECTOS
		return next()
	}

	Query('SELECT * FROM info_years WHERE year LIKE ?', [year])
	.then(function (rows) {
		req.data = rows[0][0].info
		return next()
	})
	.catch(function (error) {
		req.error = error
		return next()
	})
}
//	Get info of a specific profile from a specific year
module.exports.info_profile = function(req, res, next) {

	var allowedYears = ['40', '50', '60', '70', '80', '90']
	var allowedProfiles = ['1', '2', '3', '4', '5', '6', '7', '8']

	if(!req.params.profile || !req.params.year) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var profile = req.params.profile || null
	var year = req.params.year || null

	if(allowedYears.indexOf(year) == -1 || allowedProfiles.indexOf(profile) == -1) {
		req.error = Errores.PARAMETROS_INCORRECTOS
		return next()
	}

	Query('SELECT * FROM info_profiles WHERE year LIKE ? AND profile LIKE ?', [year, profile])
	.then(function (rows) {
		req.data = rows[0][0].info
		return next()
	})
	.catch(function (error) {
		req.error = error
		return next()
	})
}
//	Retruns an audio file
module.exports.audio = function(req, res, next) {

	var allowedYears = ['40', '50', '60', '70', '80', '90']
	var allowedProfiles = ['1', '2', '3', '4', '5', '6', '7', '8']

	if(!req.params.profile || !req.params.year || !req.params.extension) {
		req.error = Errores.NO_PARAMS
		return next()
	}

	var profile = req.params.profile || null
	var year = req.params.year || null
	var extension = req.params.extension || null

	if(allowedYears.indexOf(year) == -1 || allowedProfiles.indexOf(profile) == -1) {
		req.error = Errores.PARAMETROS_INCORRECTOS
		return next()
	}

	var location = path.join(__dirname, '..', 'files', 'noise', 'audio', year, profile + '.' + extension)

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