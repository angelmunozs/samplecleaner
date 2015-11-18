var fs = require('fs')
var async = require('async')
var path = require('path')

/*	Delete dirty files 	*/

var dirty_location = path.join(__dirname, '../files/songs/dirty')
var dirty_files = fs.readdirSync(dirty_location)

async.each(dirty_files, function (file, cb) {
	fs.unlink(path.join(dirty_location, file), function () {
		cb()
	})
}, function (error) {
	if(error) {
		console.log('Error deleting dirty files: ' + error)
	}
	else {
		console.log('%d dirty files deleted succesfully', dirty_files.length)
	}
})

/*	Delete clean files 	*/

var clean_location = path.join(__dirname, '../files/songs/clean')
var clean_files = fs.readdirSync(clean_location)

async.each(clean_files, function (file, cb) {
	fs.unlink(path.join(clean_location, file), function () {
		cb()
	})
}, function (error) {
	if(error) {
		console.log('Error deleting clean files: ' + error)
	}
	else {
		console.log('%d clean files deleted succesfully', clean_files.length)
	}
})