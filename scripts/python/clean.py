#   Noise reduction using spectral noise gating.
#   Reads a CSV file containing results of noise analysis, and proceeds
#   to reduce the noise of a song.
#   
#   Version 1.1: Noise reduction, with smoothing.
#
#	args:
#		sys.argv[1]: 	Dirty file path
#		sys.argv[2]: 	Noise year
#		sys.argv[3]: 	Noise profile
#		sys.argv[4]: 	Attenuation
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
	msg = 'Noise reduction using spectral noise gating.\nReads a CSV file containing results of noise analysis, and proceeds\nto reduce the noise of a song.\n\nVersion 1.1: Noise reduction, with smoothing.\n\nArguments (all of them are compulsory):\n\tsys.argv[1]: 	Dirty file path\n\tsys.argv[2]: 	Noise year\n\tsys.argv[3]: 	Noise profile\n\tsys.argv[4]: 	Attenuation\n\tsys.argv[5]: 	Smoothing bands'
	sys.exit(msg)

#	Args
input_original_file 	= sys.argv[1]
year 					= sys.argv[2]
profile 				= sys.argv[3]
attenuation 			= int(sys.argv[4])
nbands 					= int(sys.argv[5])

#	Debugging logs
print('Args: %s' % ', '.join(sys.argv))

#	If the file doesn't exist
if not path.isfile(input_original_file) :
	sys.exit('File \'%s\' doesn\'t exist' % input_original_file)

#	=====================================================================
#	Functions
#	=====================================================================

def smooth(x, nbands) :

	l = len(x)
	span = nbands * 2 + 1
	Output = np.zeros_like(x)

	#	Apply smoothing
	for i in range(0, l) :
		if i > nbands - 1 and i < l - nbands :
			#	y(i) = 1 / span * [y(i - N) + ... + y(i) + ... + y(i + N)]
			factor = 0
			for j in range(-nbands, nbands + 1) :
				factor = factor + x[i + j]
			Output[i] = factor / span
		else :
			Output[i] = x[i]

	return Output

#	=====================================================================
#	Conversion to WAV
#	=====================================================================

#	Input (generally non-WAV)
input_original_name, input_original_extension = path.splitext(input_original_file)
input_original_format = input_original_extension.replace('.', '', 1)

#	Converted input (WAV)
input_wav_format = 'wav'
input_wav_name = path.basename(input_original_name)
input_wav_file = input_original_file.replace(input_original_extension, '.wav', 1)

#	Original output (WAV)
output_wav_file = input_wav_file.replace('dirty', 'clean', 1)

#	Converted output
output_original_file = output_wav_file.replace('.wav', input_original_extension, 1)
output_original_format = input_original_format

#	Noise info
noise_path = path.abspath(path.join('files/noise/profiles', year, profile + '.csv'))

#	WAV extensions
wav_extensions = ['.wav']

#	Time measure
start_time_abs = time.time()
start_time = time.time()

#	If the input file is not yet a WAV
if not input_original_extension in wav_extensions :
	#	Convert to WAV
	AudioSegment.from_file(input_original_file, input_original_format).export(input_wav_file, format = input_wav_format)
	print('1. Conversion to WAV: %.4f s' % (time.time() - start_time))
	#	Time measure
	start_time = time.time()

#	=====================================================================
#	Noise reduction
#	=====================================================================

#	Read uploaded song
Fs, Song = read(input_wav_file)
#	Type conversion
Song = Song.astype(float)
#	Normalization
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
ReduceLevelUN = 1 / (10 ** (float(attenuation) / 10))
times = 0
noise_threshold = 10 ** (-1.5) # Based on studies
noise_level_tests = 100 # 100 values are enough
min_noise_gain = 0.1 # Minimum noise gain

#	Hamming window
Window = np.hamming(W)

#	Initialize
iterations = int(math.ceil(songlength / MSS))
NewSong = np.zeros((songlength + W, songchannels))
Gains = np.ones((songchannels, iterations, FFTsize))
Transforms = np.zeros((songchannels, iterations, FFTsize), dtype = complex)
Levels = np.zeros((songchannels, noise_level_tests))

#	Calculate optimum gain
for j in range(0, songchannels) :

	#	Initialize iterations
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
			mean_value = np.mean(SongSample)

			#	Windowed sample
			WindowedSample = SongSample * Window

			#	Compute FFT
			SampleTransform = abs(fft(WindowedSample))

			#	If the mean value is below the noise threshold 
			if mean_value <= noise_threshold :

				numerator = 0
				denominator = 0

				#	Calculate optimum gain (frequency domain)
				for k in range(0, len(SongSample)) :
					numerator = numerator + NoiseAbsValues[k] * SampleTransform[k]
					denominator = denominator + NoiseAbsValues[k] ** 2

				Levels[j, count] = numerator / denominator

			#	Increment iterations
			count = count + 1

		else :
			#	Break loop
			break

#	Mean value of non-zero gains
#	Waiting for a better method
level_sum = 0
level_sums = 0
for i in range(0, songchannels) :
	for j in range(0, len(Levels)) :
		if Levels[i, j] > 0 :
			level_sum = level_sum + Levels[i, j]
			level_sums = level_sums + 1

noise_level = np.max((min_noise_gain, level_sum / level_sums))

#	Print calculated optimum gain
print('2. Noise level estimation (%4f): %.4f s' % (noise_level, time.time() - start_time))
#	Time measure
start_time = time.time()

#	Apply optimum gain to noise statistics
NoiseAbsValues = NoiseAbsValues * noise_level

#	Analyze song
for j in range(0, songchannels) :

	#	Initialize iterations
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
		#	Calculate absolute values
		SongAbsValues = abs(SampleTransform)

		#	Apply gains to values under threshold
		for k in range(0, len(SongAbsValues)) :
			if SongAbsValues[k] <= NoiseAbsValues[k] :
				Gains[j][count][k] = ReduceLevelUN
		
		#	Increment iterations
		count = count + 1

print('3. Noise reduction of %d samples: %.4f s' % (songlength, time.time() - start_time))
#	Time measure
start_time = time.time()

#	Time smoothing
if not nbands == 0 :
	for j in range(0, songchannels) :
		for i in range(0, FFTsize) :
			BandGains = Gains[j, :, i]
			SmoothedBandGains = smooth(BandGains, nbands)
			Gains[j, :, i] = SmoothedBandGains

print('4. Time smoothing: %.4f s' % (time.time() - start_time))
#	Time measure
start_time = time.time()

#	Frequency smoothing
if not nbands == 0 :
	for j in range(0, songchannels) :
		for i in range(0, iterations) :
			WindowGains = Gains[j, i, :]
			SmoothedWindowGains = smooth(WindowGains, nbands)
			Gains[j, i, :] = SmoothedWindowGains

print('5. Frequency smoothing: %.4f s' % (time.time() - start_time))
#	Time measure
start_time = time.time()

#	Process song
for j in range(0, songchannels) :

	#	Initialize iterations
	count = 0

	for i in range(0, songlength - MSS, MSS) :

		#	Take stored values in arrays Transforms and Gains
		SampleTransform = Transforms[j][count]
		BandGains = Gains[j][count]

		#	Apply gains to each band
		ProcessedTransform = SampleTransform * BandGains

		#	Inverse FFT
		ProcessedSample = np.real(ifft(ProcessedTransform))

		#	Overlapp/add method for piecing together the processed windows
		NewSong[i : i + W/2, j] = NewSong[i : i + W/2, j] + ProcessedSample[0 : W/2]
		NewSong[i + W/2 : i + W - 1, j] = ProcessedSample[W/2 : W - 1]

		#	Increment iterations
		count = count + 1

#	Undo scaling by Hamming window
NewSong = NewSong / 1.08
#	Re-convert to Scipy WAV scale
ScaledSong = np.int16(NewSong * 32767)
#	Write WAV file
write(output_wav_file, Fs, ScaledSong)

print('7. Signal reconstruction and file writing: %.4f s' % (time.time() - start_time))
#	Time measure
start_time = time.time()

#	Reconvert to original format or mp3, if necessary
if not input_original_extension in wav_extensions :
	AudioSegment.from_file(output_wav_file, input_wav_format).export(output_original_file, format = output_original_format)
	print('8. Conversion to %s: %.4f s' % (input_original_format, time.time() - start_time))

print('Saved as %s' % output_original_file)

#	Exit script
sys.exit()
