//	Requirements
var glob = require('glob')
var path = require('path')

//	Export locals
module.exports = {}
var files = glob.sync(path.join(__dirname, '*.js'))
files.forEach(function(file) {
	name = path.basename(file, '.js')
	if(name != 'index')
		module.exports[name] = require(file)
})