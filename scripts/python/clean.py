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

#	=====================================================================
#	Requirements
#	=====================================================================

import sys
import time
import math
import numpy as np
from os import path
from scipy.fftpack import fft
from scipy.fftpack import ifft
from scipy.io.wavfile import write
from scipy.io.wavfile import read
from pydub import AudioSegment

#	=====================================================================
#	Some validation
#	=====================================================================

#	If not enough args, return
if len(sys.argv) < 6 :
	msg = 'Noise reduction using spectral noise gating.\nReads a CSV file containing results of noise analysis, and proceeds\nto reduce the noise of a song.\n\nVersion 1.0: Noise reduced, and time-smoothing and frequency smoothing applied.\n\nArguments (all of them are compulsory):\n\tsys.argv[1]: 	Dirty file path\n\tsys.argv[2]: 	Noise year\n\tsys.argv[3]: 	Noise profile\n\tsys.argv[4]: 	Reduce gain\n\tsys.argv[5]: 	Smoothing bands'
	sys.exit(msg)

#	Args
input_original_file 	= sys.argv[1]
noise_year 				= sys.argv[2]
noise_profile 			= sys.argv[3]
reduce_gain 			= int(sys.argv[4])
smoothing_bands 		= int(sys.argv[5])

#	Debugging logs
print('Args: %s' % ', '.join(sys.argv))

#	If the file doesn't exist
if not path.isfile(input_original_file) :
	sys.exit('File \'%s\' doesn\'t exist' % input_original_file)

#	=====================================================================
#	Aux functions
#	=====================================================================

#	Smoothing
def smooth(Input, npoints) :
	l = len(Input)
	span = npoints * 2 + 1
	Output = np.zeros(l)
	#	Apply smoothing
	for i in range(0, l) :
		if i > npoints - 1 and i < l - npoints :
			#	y(i) = 1/span * [y(i - N) + ... + y(i) + ... + y(i + N)]
			factor = 0
			for j in range(-npoints, npoints + 1) :
				factor = factor + Input[i + j]
			Output[i] = factor / span
		else :
			Output[i] = Input[i]
	return Output

#	=====================================================================
#	Conversion to WAV
#	=====================================================================

#	Input (generally non-WAV)
input_original_name, input_original_extension = path.splitext(input_original_file)
input_original_format = input_original_extension.replace('.', '', 1)

#	Converted input (WAV)
input_converted_format = 'wav'
input_converted_name = path.basename(input_original_name)
input_converted_file = input_original_file.replace(input_original_extension, '.wav', 1)

#	Original output (WAV)
output_original_file = input_converted_file.replace('dirty', 'clean', 1)

#	Converted output
output_converted_file = output_original_file.replace('.wav', input_original_extension, 1)
output_converted_format = input_original_format

#	Noise info
noise_path = path.abspath(path.join('files/noise/profiles', noise_year, noise_profile + '.csv'))

#	WAV extensions
wav_extensions = ['.wav']

#	Time measure
start_time_abs = time.time()
start_time = time.time()

#	If the input file is not yet a WAV
if not input_original_extension in wav_extensions :
	#	Convert to WAV
	AudioSegment.from_file(input_original_file, input_original_format).export(input_converted_file, format = input_converted_format)
	print('Conversion to WAV took %.4f seconds' % (time.time() - start_time))
	#	Time measure
	start_time = time.time()

#	=====================================================================
#	Noise reduction
#	=====================================================================

#	Read uploaded song
Fs, Song = read(input_converted_file)
Song = Song.astype(float)
song_norm_factor = np.max(np.abs(Song))
Song = Song / song_norm_factor

#	Read noise statistics
NoiseAbsValues = np.genfromtxt(noise_path, delimiter = ',')

#   Matrix dimensions
songchannels = Song.ndim
songlength = len(Song)
FFTsize = len(NoiseAbsValues)

#	Parameters depending on the previous ones
W = FFTsize
MSS = W / 2
ReduceLevelUN = 1.0
ReduceLevelUN = 1 / (10 ** (float(reduce_gain) / 10))
times = 0
noise_threshold = 10 ** (-1.2) #	Based on studies
noise_level_tests = 50 #	50 values are enough

#	Window
Window = np.hanning(W)

#	Initialize
iterations = int(math.ceil(songlength / MSS))
NewSong = np.zeros((songlength + W, songchannels))
Gains = np.ones((songchannels, iterations, FFTsize))
Transforms = np.zeros((songchannels, iterations, FFTsize), dtype = complex)
Levels = np.zeros((songchannels, noise_level_tests))

#	Print status
#	print('Step 1: Calculating optimum gain')

#	Calculate optimum gain
for j in range(0, songchannels) :
	count = 0

	for i in range(0, songlength - MSS, MSS) :

		if count < noise_level_tests :

			#	Calculate end of song and noise
			songend = np.amin((i + W, songlength - 1))
			
			#	Sample
			SongSample = Song[i : songend, j]

			#	If we reached the end
			if len(SongSample) < W :
				#	Fill with zeros until size equals W
				Zeros = np.zeros(W)
				Zeros[0 : len(SongSample)] = SongSample
				SongSample = Zeros

			#	Calculate mean (time domain)
			media_actual = np.mean(SongSample)

			#	Windowed sample
			WindowedSample = SongSample * Window

			#	Compute FFT
			SampleTransform = abs(fft(WindowedSample))

			#	If the mean value is below the noise threshold 
			if media_actual <= noise_threshold :

				numerador = 0
				denominador = 0

				#	Calculate optimum gain (frequency domain)
				for k in range(0, len(SongSample)) :
					numerador = numerador + NoiseAbsValues[k] * SampleTransform[k]
					denominador = denominador + NoiseAbsValues[k] ** 2

				Levels[j, count] = numerador / denominador

			count = count + 1

		else :
			break

#	Choose the best calculated gain
suma = 0
sumas = 0
for i in range(0, songchannels) :
	for j in range(0, len(Levels)) :
		if Levels[i, j] > 0 :
			suma = suma + Levels[i, j]
			sumas = sumas + 1

noise_level = np.max((0.1, np.max(Levels)))

#	Print calculated optimum gain
print('Estimated noise level: %.4f' % (noise_level))

#	Apply optimum gain to noise statistics
NoiseAbsValues = NoiseAbsValues * noise_level

#	Print status
#	print('Step 2: Taking statistics from %d samples...' % songlength)

#	Analyze song
for j in range(0, songchannels) :

	#	Print channel and initialize progress
	#	print('\tChannel no. %d' % (j + 1))
	# total = math.floor(songlength / MSS)
	# progress = 0
	count = 0
	
	for i in range(0, songlength - MSS, MSS) :
		
		#	Calculate end of song and noise
		songend = np.amin((i + W, songlength - 1))
		
		#	Sample
		SongSample = Song[i : songend, j]

		#	If we reached the end
		if len(SongSample) < W :
			#	Fill with zeros until size equals W
			Zeros = np.zeros(W)
			Zeros[0 : len(SongSample)] = SongSample
			SongSample = Zeros

		#	Windowed sample
		WindowedSample = SongSample * Window

		#	Compute FFT
		SampleTransform = fft(WindowedSample)
		#	Save into Transforms
		Transforms[j][count] = SampleTransform
		#	Calculate power
		AbsValue = abs(SampleTransform)

		#	Apply gains to values under threshold
		for k in range(0, len(AbsValue)) :
			if AbsValue[k] <= NoiseAbsValues[k] :
				Gains[j][count][k] = ReduceLevelUN
		
		#	Print proggress
		count = count + 1
		# newprogress = math.floor((100 * count / total) / 10) * 10
		# if not (progress == newprogress) :
		# 	print('\t\tProgress: %d%%' % newprogress)
		
		# progress = newprogress

print('Noise reduction took %.4f seconds' % (time.time() - start_time))
#	Time measure
start_time = time.time()

#	Print status
#	print('Step 2: Applying time smoothing to gains...')
#	TODO
print('Time smoothing took %.4f seconds' % (time.time() - start_time))
#	Time measure
start_time = time.time()

#	Print status
#	print('Step 3: Applying frequency smoothing to gains...')

# for i in range(0, songchannels) :
# 	for j in range(0, iterations) :
# 		Gains[i][j] = smooth(Gains[i][j], smoothing_bands)

print('Frequency smoothing took %.4f seconds' % (time.time() - start_time))
#	Time measure
start_time = time.time()

#	Print status
#	print('Step 4: Applying noise gate to %d samples...' % songlength);

#	Process song
for j in range(0, songchannels) :

	#	Print channel and initialize progress
	#	print('\tChannel no. %d' % (j + 1))
	# total = math.floor(songlength / MSS)
	# progress = 0
	count = 0

	for i in range(0, songlength - MSS, MSS) :

		#	Take stored values in arrays Transforms and Gains
		SampleTransform = Transforms[j][count]
		TransformGains = Gains[j][count]

		#	Apply gains to each band
		ProcessedTransform = SampleTransform * TransformGains

		#	Inverse FFT
		ProcessedSample = np.real(ifft(ProcessedTransform))

		#	Overlapp/add method for piecing together the processed windows
		NewSong[i : i + W/2, j] = NewSong[i : i + W/2, j] + ProcessedSample[0 : W/2]
		NewSong[i + W/2 : i + W - 1, j] = ProcessedSample[W/2 : W - 1]

		#	Print proggress
		count = count + 1
		# newprogress = math.floor((100 * count / total) / 10) * 10
		# if not (progress == newprogress) :
		# 	print('\t\tProgress: %d%%' % newprogress)
		
		# progress = newprogress

#	Write clean song
ScaledSong = np.int16(NewSong * 32767)
write(output_original_file, Fs, ScaledSong)
print('File writing took %.4f seconds' % (time.time() - start_time))
#	Time measure
start_time = time.time()

#	Reconvert to original format or mp3
if not input_original_extension in wav_extensions :
	AudioSegment.from_file(output_original_file, input_converted_format).export(output_converted_file, format = output_converted_format)
	print('Conversion to %s took %.4f seconds' % (input_original_format, time.time() - start_time))

print('Saved as %s' % (output_converted_file))
#print('Elapsed time: %.4f seconds' % (time.time() - start_time_abs))
sys.exit()
