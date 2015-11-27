var fs 		= require('fs')
var path 	= require('path')

var audio = '/home/angel/samplecleaner/files/noise/audio/'
var audioparent = fs.readdirSync(audio)
var profiles = '/home/angel/samplecleaner/files/noise/profiles/'
var profilesparent = fs.readdirSync(profiles)

// fs.mkdirSync(path.join(audio, '40'))
// fs.mkdirSync(path.join(audio, '50'))
// fs.mkdirSync(path.join(audio, '60'))
// fs.mkdirSync(path.join(audio, '70'))
// fs.mkdirSync(path.join(audio, '80'))
// fs.mkdirSync(path.join(audio, '90'))
// fs.mkdirSync(path.join(profiles, '40'))
// fs.mkdirSync(path.join(profiles, '50'))
// fs.mkdirSync(path.join(profiles, '60'))
// fs.mkdirSync(path.join(profiles, '70'))
// fs.mkdirSync(path.join(profiles, '80'))
// fs.mkdirSync(path.join(profiles, '90'))

console.log('Renaming WAV files')
console.log('')

for(var i = Number(audioparent[0]); i <= Number(audioparent[audioparent.length - 1]); i = i + 10) {

	var dir = path.join(audio, i.toString())
	var children = fs.readdirSync(dir)

	for(var j in children) {

		var oldname = children[j]
		var newname = oldname.replace(i.toString() + 's', '')

		fs.renameSync(path.join(dir, oldname), path.join(dir, newname))
		console.log('\t%s --> %s', oldname, newname)
	}
}

console.log('')
console.log('Renaming CSV files')
console.log('')

for(var i = Number(profilesparent[0]); i <= Number(profilesparent[profilesparent.length - 1]); i = i + 10) {

	var dir = path.join(profiles, i.toString())
	var children = fs.readdirSync(dir)

	for(var j in children) {

		var oldname = children[j]
		var newname = oldname.replace(i.toString() + 's', '')

		fs.renameSync(path.join(dir, oldname), path.join(dir, newname))
		console.log('\t%s --> %s', oldname, newname)
	}
}
