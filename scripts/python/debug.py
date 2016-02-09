#	=====================================================================
#	Requirements
#	=====================================================================

import sys
import time
import math
import numpy as np
from os import path
from magic import Magic
from scipy.fftpack import fft
from scipy.fftpack import ifft
from scipy.io.wavfile import write
from scipy.io.wavfile import read
from pydub import AudioSegment
mime = Magic(mime = True)

#	=====================================================================
#	Some validation
#	=====================================================================

#	If not enough args, return
if not len(sys.argv) == 2 :
	msg = 'This script takes exactly ONE argument'
	sys.exit(msg)

#	Args
input_original_file = sys.argv[1]
output_original_file = input_original_file.replace('dirty', 'clean', 1)

#	Time measure
start_time = time.time()

#	If the file doesn't exist
if not path.isfile(input_original_file) :
	sys.exit('File \'%s\' doesn\'t exist' % input_original_file)

#	Read uploaded song
Fs, Song = read(input_original_file)
Song = Song.astype(float)
song_norm_factor = np.max(np.abs(Song))
Song = Song / song_norm_factor

#   Matrix dimensions
songchannels = Song.ndim
songlength = len(Song)
FFTsize = 2048

#	Parameters depending on the previous ones
W = FFTsize
MSS = W / 2

#	Window
#	Window = np.hanning(W)
#	MATLAB-generated window
Window = np.genfromtxt(path.abspath('files/windows/hann' + str(W) + '.csv'), delimiter = ',')

#	Initialize
NewSong = np.zeros((songlength + W, songchannels))
SampleBeforeIfft = np.zeros(W)
SampleTransform = np.zeros(W)
SampleAfterIfft = np.zeros(FFTsize)

#	Analyze song
for j in range(0, songchannels) :
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

		#	Compute IFFT
		ProcessedSample = np.real(ifft(SampleTransform))

		#	Overlapp/add method for piecing together the processed windows
		NewSong[i : i + W/2 - 1, j] = NewSong[i : i + W/2 - 1, j] + ProcessedSample[0 : W/2 - 1]
		NewSong[i + W/2 : i + W - 1, j] = ProcessedSample[W/2 : W - 1]

		#	Output text files for debugging
		if j == 0 and i == 100 * MSS :
			SampleBeforeIfft = WindowedSample
			SampleAfterIfft = ProcessedSample
			#	Check if there's a big difference between the original sample and the inverted sample
			# for k in range(0, FFTsize) :
			# 	if abs(SampleBeforeIfft[k] - SampleAfterIfft[k]) > 1e-17 :
			# 		print k

#	Write clean song
ScaledSong = np.int16(NewSong * 32767)
write(output_original_file, Fs, ScaledSong)
print('Done (took %.4f seconds)' % (time.time() - start_time))

#	Write output text files for debugging
#	np.savetxt('/home/angel/samplecleaner/test/clean/SampleBeforeIfft.csv', SampleBeforeIfft, delimiter = ',')
#	np.savetxt('/home/angel/samplecleaner/test/clean/SampleAfterIfft.csv', SampleAfterIfft, delimiter = ',')
#	np.savetxt('/home/angel/samplecleaner/test/clean/SampleTransform.csv', SampleTransform, delimiter = ',')
#	np.savetxt('/home/angel/samplecleaner/test/clean/hann2048.csv', Window, delimiter = ',')