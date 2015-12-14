#	Analyzes the noise samples from a folder and saves statistics.
#	Reads audio files in a folder containing recorded noise samples, and saves the result of an analysis by frequency bands in CSV files.
#
#	CRITERION: Maximum power
#
#	Parameters:
#		output (String):				Path for output CSV files
#		path (String):					Path for noise audio files
#		extension (String):				Audio files extension
#		W (Integer):					Window size, in samples
#		MSS (Integer):					Number of non-overlapped samples per window
#		FFTsize (Integer):				Size of FFT

#	=====================================================================
#	Requirements
#	=====================================================================

import sys
import time
import math
import csv
import numpy as np
from os import path
from os import listdir
from magic import Magic
from scipy.fftpack import fft
from scipy.fftpack import ifft
from scipy.io.wavfile import write
from scipy.io.wavfile import read
from pydub import AudioSegment
mime = Magic(mime = True)

#	=====================================================================
#	Get profiles
#	=====================================================================

#	Parameters
output_path = 'files/noise/profiles'
audio_path = 'files/noise/audio'
extension = '.wav'
FFTsizePower = 11
FFTsize = 2 ** FFTsizePower
W = FFTsize
MSS = W / 2

#	Window
Window = np.hanning(W)

#	Read files
folders = [f for f in listdir(audio_path) if path.isdir(path.join(audio_path, f))]
for l in range(0, len(folders)) :

	files = [g for g in listdir(path.join(audio_path, folders[l])) if path.isfile(path.join(audio_path, folders[l], g))]
	for m in range(0, len(files)) :

		#	Read WAV file
		Fs, Noise = read(path.join(audio_path, folders[l], files[m]))
		Noise = Noise.astype(float)
		noise_norm_factor = np.max(np.abs(Noise))
		Noise = Noise / noise_norm_factor

	    #	Matrix dimensions
		noisechannels = Noise.ndim
		noiselength = len(Noise)

		#	Initialize
		iterations = int(math.ceil(noiselength / MSS))
		Powers = np.zeros((iterations, noisechannels, FFTsize))
		NoisePowers = np.zeros((FFTsize, noisechannels))
		MaxPowers = np.zeros(FFTsize)

		print('File %d/%d: %s' % (m + 1 + l * len(files), len(folders) * len(files), path.join(audio_path, folders[l], files[m])))

		#	For every channel of the sound (1 - mono, 2 - stereo, ...)
		for j in range(0, noisechannels) :

			count = 0

			#	For every window
			for i in range(0, noiselength - MSS, MSS) :

				#	Calculate end of song and noise
				noiseend = np.amin((i + W, noiselength - 1))
				
				#	Sample
				NoiseSample = Noise[i : noiseend, j]

				#	If we reached the end
				if len(NoiseSample) < W :
					#	Fill with zeros until size equals W
					Zeros = np.zeros(W)
					Zeros[0 : len(NoiseSample)] = NoiseSample
					NoiseSample = Zeros

				#	Windowed sample
				WindowedSample = NoiseSample * Window

				#	Compute FFT
				NoiseTransform = fft(WindowedSample)
				#	Calculate power
				Power = abs(NoiseTransform) ** 2
				#	Save
				Powers[count][j] = Power
				
				#	Print proggress
				count = count + 1

		#	For every channel of the sound (1 - mono, 2 - stereo, ...)
		for k in range(0, noisechannels) :

			#	For each window analyzed
			for i in range(0, FFTsize) :

				NoisePowers[i][k] = Powers[1][k][i]

				#	Calculate the maximum of the powers of noise in that band
				for j in range(0, iterations) :

					if Powers[j][k][i] > NoisePowers[i][k] :
						NoisePowers[i][k] = Powers[j][k][i]

				#	Maximum of both channels
				MaxPowers[i] = np.amax(NoisePowers[i])

		MaxPowers = MaxPowers / np.max(MaxPowers)
		profile_name = path.join(output_path, folders[l], files[m].replace('wav', 'csv', 1))
		np.savetxt(profile_name, MaxPowers, delimiter = ',')