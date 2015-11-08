//	Requirements
var async 		= require('async')
var path 		= require('path')
var fs 			= require('fs')

//	Get info of noise samples
module.exports.samples = function(req, res, next) {

	var location = path.join(__dirname, '..', 'files', 'noise', 'samples')
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