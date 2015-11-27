var fs 		= require('fs')
var path 	= require('path')
var util 	= require('util')
var shell 	= require('shellscript').globalize()
var async 	= require('async')
var config 	= require('../../config')

/*	Delete dirty files 	*/
var deleteDirtyFiles = function (cb) {

	var dirty_location = path.join(__dirname, '../../files/songs/dirty')
	var dirty_files = fs.readdirSync(dirty_location)

	//	Log actions
	console.log('Deleting %d dirty file%s', dirty_files.length, dirty_files.length == 1 ? '' : 's')

	async.each(dirty_files, function (file, cb) {
		fs.unlink(path.join(dirty_location, file), function () {
			cb()
		})
	}, function (error) {
		if(error) {
			cb('Error deleting dirty files: ' + error)
		}
		else {
			cb()
		}
	})
}

/*	Delete clean files 	*/
var deleteCleanFiles = function (cb) {
	var clean_location = path.join(__dirname, '../../files/songs/clean')
	var clean_files = fs.readdirSync(clean_location)

	//	Log actions
	console.log('Deleting %d clean file%s', clean_files.length, clean_files.length == 1 ? '' : 's')

	async.each(clean_files, function (file, cb) {
		fs.unlink(path.join(clean_location, file), function () {
			cb()
		})
	}, function (error) {
		if(error) {
			cb('Error deleting clean files: ' + error)
		}
		else {
			cb()
		}
	})
}

/*	Reset database */
var resetDB = function (cb) {

	//	Log actions
	console.log('Resetting DB')

	//	Reset database, as a shell script
	var script = util.format("mysql -u %s -p%s samplecleaner < %s", config.DB_USER, config.DB_PASS, path.join(__dirname, '../../base.sql'))
	var result = shell(script)

	if(result.stderr) {
		return cb(result.stderr)
	}
	cb()
}

async.series([deleteDirtyFiles, deleteCleanFiles, resetDB], function (error) {
	if(error) {
		console.log(error)
	}
})