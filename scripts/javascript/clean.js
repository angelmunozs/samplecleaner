var async 	= require('async')
var path 	= require('path')
var wav 	= require('wav')
var dsp 	= require('dsp')
var fs 		= require('fs')

function smooth(Input, sm_bands) {
	var l = Input.length
	var span = sm_bands * 2 + 1
	var Output = Array(Input.length)
	//	Apply smoothing
	for(var i = 0; i < l; i++) {
		if(i > sm_bands - 1 && i < l - sm_bands) {
			//	y(i) = 1/span * [y(i - N) + ... + y(i) + ... + y(i + N)]
			var factor = 0
			for(var j = -sm_bands; j <= sm_bands; j++) {
				factor = factor + Input[i + j]
			}
			Output[i] = factor / span
		}
		else {
			Output[i] = Input[i]
		}
	}
	return Output
}

var input_path = path.join(__dirname, '../../test/dirty/Raphael - Yo soy aquel.wav')
var output_path = path.join(__dirname, '../../test/clean/Raphael - Yo soy aquel.wav')
var reader = new wav.Reader()

async.series([
		function readWav (cb) {

			var file = fs.createReadStream(input_path)
			file.pipe(reader)

			reader.once('readable', function () {
				// console.log('WaveHeader Size:\t%d',		12)
				// console.log('ChunkHeader Size:\t%d',	8)
				// console.log('FormatChunk Size:\t%d',	reader.subchunk1Size)
				// console.log('RIFF ID:\t\t%s',			reader.riffId)
				// console.log('Total Size:\t\t%d',		reader.chunkSize)
				// console.log('Wave ID:\t\t%s',			reader.waveId)
				// console.log('Chunk ID:\t\t%s',			reader.chunkId)
				// console.log('Chunk Size:\t\t%d',		reader.subchunk1Size)
				// console.log('Compression format is of type: %d', reader.audioFormat)
				// console.log('Channels:\t\t%d',			reader.channels)
				// console.log('Sample Rate:\t\t%d',		reader.sampleRate)
				// console.log('Bytes / Sec:\t\t%d',		reader.byteRate)
				// console.log('wBlockAlign:\t\t%d',		reader.blockAlign)
				// console.log('Bits Per Sample Point:\t%d', reader.bitDepth)
				// console.log('wavDataPtr:\t\t%d',		0)
				// console.log('wavDataSize:\t\t%d',		reader.subchunk2Size)
				// console.log()
				cb()
			})
		},
		function cleanWav (cb) {
			console.log(reader._readableState.buffer.length)
			cb()
		}

	], function (error) {
	if(error) {
		console.log(error)
	}
})


