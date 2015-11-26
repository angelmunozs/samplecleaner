var fs = require('fs')
var async = require('async')
var path = require('path')

/*	Delete dirty files 	*/
var deleteDirtyFiles = function (cb) {

	var dirty_location = path.join(__dirname, '../files/songs/dirty')
	var dirty_files = fs.readdirSync(dirty_location)

	//	Log actions
	console.log('Deleting %d dirty files', dirty_files.length)

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
	var clean_location = path.join(__dirname, '../files/songs/clean')
	var clean_files = fs.readdirSync(clean_location)

	//	Log actions
	console.log('Deleting %d clean files', clean_files.length)

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

	//	TODO
	cb()
}

async.parallel([deleteDirtyFiles, deleteCleanFiles, resetDB], function (error) {
	if(error) {
		console.log(error)
	}
})