import sys
from os import path
#	Library for converting files to WAV
from pydub import AudioSegment
#	Library for MIME types
import magic
mime = magic.Magic(mime = True)
#	Library for signal processing
from scipy import io


#	If not enough args, return
if len(sys.argv) < 2 :
	sys.exit('Missing argument: path to an existing file')

input_file = sys.argv[1]

#	If the file doesn't exist
if not path.isfile(input_file) :
	sys.exit('File doesn\'t exist')

#	Check for the extension
input_name, input_extension = path.splitext(input_file)
input_mime = mime.from_file(input_file)

#	Output parameters
output_format = 'wav'
output_name = path.basename(input_name)
output_path = path.dirname(input_file)
output_file = path.join(output_path, output_name + '.' + output_format)

#	WAV MIME types
wav_types = ['audio/x-wav', 'audio/wav', 'audio/vnd.wav']
wav_extensions = ['.wav']

#	If the type is already a WAV
if (input_mime in wav_types) and (input_extension in wav_extensions) :
	#	Logging
	print('Processing file: %s' % output_file)
else :
	#	Logging
	print('Converting file: %s' % input_file)
	AudioSegment.from_file(input_file, input_extension.replace('.', '', 1)).export(output_file, format = output_format)
	#	Logging
	print('Processing file: %s' % output_file)
