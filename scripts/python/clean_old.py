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

#	=====================================================================
#	Requirements
#	=====================================================================

import sys
import time
import math
import magic
import os
import numpy as np
import scipy.fftpack as fftpack
import scipy.io.wavfile as wav
from pydub import AudioSegment
mime = magic.Magic(mime = True)

#	=====================================================================
#	Some validation
#	=====================================================================

#	If not enough args, return
if len(sys.argv) < 6 :
	msg = 	'Noise reduction using spectral noise gating.\nReads a CSV file containing results of noise analysis, and proceeds\nto reduce the noise of a song.\n\nVersion 1.0: Noise reduced, and time-smoothing and frequency smoothing applied.\n\nArguments (all of them are compulsory):\n\tsys.argv[1]: 	Dirty file path\n\tsys.argv[2]: 	Noise year\n\tsys.argv[3]: 	Noise profile\n\tsys.argv[4]: 	Reduce gain\n\tsys.argv[5]: 	Smoothing bands'
	sys.exit(msg)

#	Args
input_original_file 	= sys.argv[1]
noise_year 				= sys.argv[2]
noise_profile 			= sys.argv[3]
reduce_gain 			= sys.argv[4]
smoothing_bands 		= sys.argv[5]

#	Debugging logs
print('Args: %s' % ', '.join(sys.argv))

#	If the file doesn't exist
if not os.path.isfile(input_original_file) :
	sys.exit('File doesn\'t exist')

#	=====================================================================
#	Conversion to WAV
#	=====================================================================

#	Input (generally non-WAV)
input_original_name, input_original_extension = os.path.splitext(input_original_file)
input_original_mime = mime.from_file(input_original_file)
input_original_format = input_original_extension.replace('.', '', 1)

#	Converted input (WAV)
input_converted_format = 'wav'
input_converted_name = os.path.basename(input_original_name)
input_converted_file = input_original_file.replace(input_original_extension, '.wav')

#	Original output (WAV)
output_original_file = input_converted_file.replace('dirty', 'clean', 1)

#	Converted output
output_converted_file = output_original_file.replace('.wav', input_original_extension, 1)
output_converted_format = input_original_format

#	Noise info
#	noise_path = os.path.abspath(os.path.join(os.getcwd(), '../../', 'files/noise/profiles', noise_year, noise_profile + '.csv'))
noise_path = os.path.abspath(os.path.join('files/noise/profiles', noise_year, noise_profile + '.csv'))

#	WAV MIME types
wav_extensions = ['.wav']

#	Time measure
start_time = time.time()

#	If the input file is not yet a WAV
if not input_original_extension in wav_extensions :
	#	CONvert to WAV
	AudioSegment.from_file(input_original_file, input_original_format).export(input_converted_file, format = input_converted_format)
	print('Conversion to WAV took %.4f seconds' % (time.time() - start_time))
	#	Time measure
	start_time = time.time()

#	=====================================================================
#	Noise reduction
#	=====================================================================

#	Read uploaded song
Fs, Song = wav.read(input_converted_file)
Song = Song.astype(float)
song_norm_factor = np.amax((math.fabs(np.amax(Song)), math.fabs(np.amin(Song))))
Song = Song / song_norm_factor

#	Read noise statistics
NoisePowers = np.genfromtxt(noise_path, delimiter = ',')
NoisePowers = 0.16 * NoisePowers

#   Matrix dimensions
songchannels = Song.ndim
songlength = len(Song)
noisechannels = NoisePowers.ndim
FFTsize = len(NoisePowers)

#	Parameters depending on the previous ones
W = FFTsize
MSS = W / 2
ReduceLevelUN = 1.0
ReduceLevelUN = 1 / (10 ** (float(reduce_gain) / 10))
times = 0

#	Window
Window = np.hanning(W)

#	Initialize
iterations = math.ceil(songlength / MSS)
NewSong = np.zeros((songlength + W, songchannels))

#	Print status
print('Step 1: Taking statistics from %d samples...' % songlength)

#	Analyze song
for j in range(0, songchannels) :

	#	Print channel and initialize progress
	print('\tChannel no. %d' % (j + 1))
	# total = math.floor(songlength / MSS)
	# progress = 0
	count = 0
	
	for i in range(0, songlength, MSS) :
		
		#	Calculate end of song and noise
		songend = np.amin((i + W, songlength - 1))
		
		#	Sample
		SongSample = Song[i : songend, j]

		#	If we reached the end
		if len(SongSample) < W :
			#	Fill with zeros until size equals W
			Zeros = np.zeros(W, dtype = int)
			Zeros[0 : len(SongSample)] = SongSample
			SongSample = Zeros

		#	Windowed sample
		WindowedSample = SongSample * Window
		
		#	Compute FFT
		SampleTransform = fftpack.fft(WindowedSample)
		#	Calculate power
		Power = abs(SampleTransform) ** 2

		#	Apply gains to values under threshold
		for k in range(0, len(Power)) :
			if Power[k] <= NoisePowers[k, j] :
				SampleTransform[k] = SampleTransform[k] * ReduceLevelUN
		
		#	Inverse FFT
		ProcessedSample = np.real(fftpack.ifft(SampleTransform))

		#	Overlapp/add method for piecing together the processed windows
		NewSong[i : i + W/2 - 1, j] = NewSong[i : i + W/2 - 1, j] + ProcessedSample[0 : W/2 - 1]
		NewSong[i + W/2 : i + W - 1, j] = ProcessedSample[W/2 : W - 1]

		#	Print proggress
		count = count + 1
		# newprogress = math.floor((100 * count / total) / 10) * 10
		# if not (progress == newprogress) :
		# 	print('\t\tProgress: %d%%' % newprogress)
		
		# progress = newprogress

#	Write clean song
wav.write(output_original_file, Fs, NewSong)
print('Noise reduction and file writing took %.4f seconds' % (time.time() - start_time))
#	Time measure
start_time = time.time()

#	Reconvert to original format
if not input_original_extension in wav_extensions :
	AudioSegment.from_file(output_original_file, input_converted_format).export(output_converted_file, format = output_converted_format)
	print('Conversion to %s took %.4f seconds' % (input_original_format, time.time() - start_time))
	#	Time measure
	start_time = time.time()
