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
import os
from scipy.fftpack import fft
from scipy.fftpack import ifft
from scipy.io.wavfile import read
from pydub import AudioSegment

#	=====================================================================
#	Get profiles
#	=====================================================================

#	Parameters
output_path = 'files/noise/profiles'
audio_path = 'files/noise/audio'
extension = '.wav'
FFTsizePower = 12
FFTsize = 2 ** FFTsizePower
W = FFTsize
MSS = W / 2
print 'FFT size: ', FFTsize

#	Window
Window = np.hanning(W)

#	Read files
folders = [f for f in os.listdir(audio_path) if os.path.isdir(os.path.join(audio_path, f))]
for l in range(0, len(folders)) :

	#	If the folder doesn't exist, create it
	if not os.path.exists(os.path.join(output_path, folders[l])) :
		os.mkdir(os.path.join(output_path, folders[l]))

	files = [g for g in os.listdir(os.path.join(audio_path, folders[l])) if os.path.isfile(os.path.join(audio_path, folders[l], g))]
	for m in range(0, len(files)) :

		#	Read WAV file
		Fs, Noise = read(os.path.join(audio_path, folders[l], files[m]))
		Noise = Noise.astype(float)
		noise_norm_factor = np.max(np.abs(Noise))
		Noise = Noise / noise_norm_factor

	    #	Matrix dimensions
		noisechannels = Noise.ndim
		noiselength = len(Noise)

		#	Initialize
		iterations = int(math.ceil(noiselength / MSS))
		AbsValues = np.zeros((iterations, noisechannels, FFTsize))
		NoiseAbsValues = np.zeros((FFTsize, noisechannels))
		MaxAbsValues = np.zeros(FFTsize)

		print('File %d/%d: %s' % (m + 1 + l * len(files), len(folders) * len(files), os.path.join(audio_path, folders[l], files[m])))

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
				AbsValue = abs(NoiseTransform)
				#	Save
				AbsValues[count][j] = AbsValue
				
				#	Print proggress
				count = count + 1

		#	For every channel of the sound (1 - mono, 2 - stereo, ...)
		for k in range(0, noisechannels) :

			#	For each window analyzed
			for i in range(0, FFTsize) :

				NoiseAbsValues[i][k] = AbsValues[1][k][i]

				#	Calculate the maximum of the powers of noise in that band
				for j in range(0, iterations) :

					if AbsValues[j][k][i] > NoiseAbsValues[i][k] :
						NoiseAbsValues[i][k] = AbsValues[j][k][i]

				#	Maximum of both channels
				MaxAbsValues[i] = np.amax(NoiseAbsValues[i])

		#	Save CSV
		profile_name = os.path.join(output_path, folders[l], files[m].replace('wav', 'csv', 1))
		np.savetxt(profile_name, MaxAbsValues, delimiter = ',')