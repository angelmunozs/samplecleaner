#   Noise reduction using spectral noise gating.
#   Reads a CSV file containing results of noise analysis, and proceeds
#   to reduce the noise of a song.
#   
#   Version 1.0: Noise reduced, and time-smoothing and frequency smoothing applied.
#
#	args:
#		sys.argv[1]: 	Dirty file path
#		sys.argv[2]: 	Noise year
#		sys.argv[3]: 	Noise profile
#		sys.argv[4]: 	Reduce gain
#		sys.argv[5]: 	Smoothing bands
#
#
#	=====================================================================
#	Requirements
#	=====================================================================

import sys
import os.path as path
import csv
from pydub import AudioSegment
import scipy.io.wavfile as wav
import magic
mime = magic.Magic(mime = True)

#	=====================================================================
#	Some validation
#	=====================================================================

#	If not enough args, return
if len(sys.argv) < 6 :
	sys.exit('Missing arguments')

#	Args
input_original_file 	= sys.argv[1]
noise_year 				= sys.argv[2]
noise_profile 			= sys.argv[3]
reduce_gain 			= sys.argv[4]
smoothing_bands 		= sys.argv[5]

#	Debugging logs
# for i in sys.argv:
# 	print i

#	If the file doesn't exist
if not path.isfile(input_original_file) :
	sys.exit('File doesn\'t exist')

#	=====================================================================
#	Conversion to WAV
#	=====================================================================

#	Input (generally non-WAV)
input_original_name, input_original_extension = path.splitext(input_original_file)
input_original_mime = mime.from_file(input_original_file)
input_original_format = input_original_extension.replace('.', '', 1)

#	Converted input (WAV)
input_converted_format = 'wav'
input_converted_name = path.basename(input_original_name)
input_converted_file = input_original_file.replace(input_original_extension, '.wav')

#	Original output (WAV)
output_original_file = input_converted_file.replace('dirty', 'clean', 1)

#	Converted output
output_converted_file = output_original_file.replace('.wav', input_original_extension, 1)
output_converted_format = input_original_format

#	Noise info
noise_path = path.abspath(path.join('files/noise/profiles', noise_year, noise_profile + '.csv'))

#	WAV MIME types
wav_extensions = ['.wav']

#	If the type is already a WAV
if not input_original_extension in wav_extensions :
	#	Logging
	print('Converting %s file to WAV: %s' % (input_original_format, input_original_file))
	AudioSegment.from_file(input_original_file, input_original_format).export(input_converted_file, format = input_converted_format)

#	=====================================================================
#	Noise reduction
#	=====================================================================

#	Read uploaded song
Fs, Song = wav.read(input_converted_file, False)
#	Read noise statistics
with open(noise_path, "rb") as csvFile :
	NoisePowers = csv.reader(noise_path)

#   Matrix dimensions


#	TODO: Cleaning
NewSong = Song

#	Write clean song
print('Saving clean file as: %s' % output_original_file)
wav.write(output_original_file, Fs, NewSong)
#	Reconvert to original format
if not input_original_extension in wav_extensions :
	print('Re-converting WAV to original format %s: %s' % (input_original_format, output_converted_file))
	AudioSegment.from_file(output_original_file, input_converted_format).export(output_converted_file, format = output_converted_format)