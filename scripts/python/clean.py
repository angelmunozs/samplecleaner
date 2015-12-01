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
import numpy as np
import os.path as path
import scipy.fftpack as fftpack
import scipy.io.wavfile as wav
from pydub import AudioSegment
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

#	Time measure
start_time = time.time()

#	If the type is already a WAV
if not input_original_extension in wav_extensions :
	#	Logging
	AudioSegment.from_file(input_original_file, input_original_format).export(input_converted_file, format = input_converted_format)
	print('Conversion to WAV took %.4f seconds' % (time.time() - start_time))
	#	Time measure
	start_time = time.time()

#	=====================================================================
#	Noise reduction
#	=====================================================================

#	Read uploaded song
Fs, Song = wav.read(input_converted_file)
#	Song = song.astype(float)
#	Song = Song / np.amax(math.fabs(np.amax(Song)), math.fabs(np.amin(Song)))

#	Read noise statistics
NoisePowers = np.genfromtxt(noise_path, delimiter = ',')

#   Matrix dimensions
songchannels = Song.ndim
songlength = len(Song)
noisechannels = NoisePowers.ndim
FFTsize = len(NoisePowers)

#	Parameters depending on the previous ones
W = FFTsize
MSS = W / 2
ReduceLevelUN = 1 / (10 ^ int(reduce_gain) / 10)
times = 0

#	Window
Window = np.hanning(W)

#	Initialize
iterations = math.ceil(songlength / MSS)
NewSong = np.zeros((songlength + W, songchannels))
Gains = np.ones((songchannels, iterations, FFTsize))
Transforms = np.zeros((songchannels, iterations, FFTsize), dtype = complex)

#	Print status
print('\tStep 1: Taking statistics from %d samples...' % songlength)

#	Analyze song
j = 0
while j < songchannels :

	#	Print channel and initialize progress
	print('\t\tChannel no. %d' % j + 1)
	total = math.floor(songlength / MSS)
	count = 0
	progress = 0
	
	i = 0
	while i < songlength :

		#	Print proggress
		count = count + 1
		newprogress = math.floor((100 * count / total) / 10) * 10
		if not (progress == newprogress) :
			print('\t\t\tProgress: %d%%' % newprogress)
		
		progress = newprogress
		
		#	Calculate end of song and noise
		songend = np.amin((i + W, songlength))
		
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
		#	Save into Transforms
		Transforms[j][count] = SampleTransform
		#	Calculate power
		Power = abs(SampleTransform) ** 2

		#	Calculate the gains to apply later
		k = 0
		while k < FFTsize :
			if Power[k] <= NoisePowers[k, j] :
				times = times + 1
				Gains[j][count][k] = ReduceLevelUN

			k = k + 1
		i = i + MSS
	j = j + 1

#	Print status
print('\tStep 2: Applying time smoothing to gains...')
print('\t\tDoing %d operations' % (FFTsize * songchannels))
#	TODO: Time smoothing

#	Print status
print('\tStep 3: Applying frequency smoothing to gains...')
print('\t\tDoing %d operations' % iterations * songchannels)
#	TODO: Frequency smoothing

#	Print status
print('\tStep 4: Applying noise gate to %d samples...' % songlength);

#	Process song
j = 0
while j < songchannels :

	#	Print channel and initialize progress
	print('\t\tChannel no. %d' % j + 1)
	total = math.floor(songlength / MSS)
	count = 0
	progress = 0

	i = 0
	while i < songlength :

		#	Print proggress
		count = count + 1
		newprogress = math.floor((100 * count / total) / 10) * 10
		if not (progress == newprogress) :
			print('\t\t\tProgress: %d%%' % newprogress)
		
		progress = newprogress
		
		#	Take stored values in arrays Transforms and Gains
		SampleTransform = Transforms[j][count]
		TransformGains = Gains[j][count]

		#	Apply gains to each band
		ProcessedTransform = SampleTransform * TransformGains

		#	Inverse FFT
		ProcessedSample = np.real(fftpack.ifft(ProcessedTransform))

		#	Overlapp/add method for piecing together the processed windows
		NewSong[i : i + W/2 - 1, j] = NewSong[i : i + W/2 - 1, j] + ProcessedSample[1 : 1 + W/2 - 1, 1]
		NewSong[i + W/2 : i + W - 1, j] = ProcessedSample[1 + W/2 : 1 + W - 1, 1]

		i = i + MSS
	j = j + 1

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
