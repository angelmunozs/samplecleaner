//	Requirements
var async 		= require('async')
var path 		= require('path')
var fs 			= require('fs')
var config 		= require('../config')


var location = 'files/noise/profiles'

var files = fs.readdirSync(location)
console.log(files)