//	Requirements
var glob = require('glob')
var async = require('async')
var path = require('path')

module.exports = {
	load : function() {
		var files = glob.sync(path.join(__dirname, '*.js'))
		async.each(files, function(file, cb) {
			if (!/index.js$/.test(file)) {
				require(file).load(cb)
			}
		}, function(error) {
			if(error) {
				console.log(error)
			}
		})
	}
}