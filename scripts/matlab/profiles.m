%   Analyzes the noise samples from a folder and saves statistics.
%   Reads audio files in a folder containing recorded noise samlpes, and
%   saves the result of an analysis by frequency bands in CSV files.
%
%   CRITERION: Maximum power
%
%   Parameters:
%       output (String):                Path for output CSV files
%       path (String):                  Path for noise audio files
%       extension (String):             Audio files extension
%       W (Integer):                    Window size, in samples
%       MSS (Integer):                  Number of non-overlapped samples
%                                       per window
%       FFTsize (Integer):              Size of FFT
%       print_figures (Boolean):        Do you wish to see the result in
%                                       MATLAB figures?
%
%   ======================================================================

%   Time measure;
tic;

%   Reset workspace
close all; clear variables; clc;

%   ======================================================================

%   Parameters
output = 'profiles\\';
path = 'noise\\';
extension = '.wav';
FFTsizePower = 11;
FFTsize = 2 ^ FFTsizePower;
W = FFTsize;
MSS = W / 2;
print_figures = false;

%   ======================================================================

%   Window
Window = hann(W);

%   Read location
files = dir(strcat(path, '*', extension));
%   Skip folders
files = files(cellfun(@(x) x == 0, {files.isdir}));
%   Number of WAV files
numfiles = length(files);

%   Process noise
for m = 1 : numfiles
    
    %   Read audio file
    [filepath, filename, fileext] = fileparts(strcat(path, ...
        files(m).name));
    [Noise, Fs] = audioread(strcat(path, filename, fileext));
    
    %   Matrix dimensions
    n = size(Noise);
    noisechannels = n(2);
    noiselength = n(1);

    %   Initialize
    NoisePowers = zeros(FFTsize, noisechannels);
    MaxPowers = zeros(FFTsize, 1);
    iterations = ceil(noiselength / MSS);
    Powers = zeros(iterations, noisechannels, FFTsize);
    
    fprintf('File no. %d: %s\n', m, files(m).name);
    
    %   For every windowed sample
    for j = 1 : noisechannels
        
        count = 0;

        %   For every channel of the sound (1 - mono, 2 - stereo, ...)
        for i = 1 : MSS : noiselength
            
            count = count + 1;
            
            %   Calculate end of the noise sample
            noiseend = min(i + W - 1, noiselength);
            
            %   Sample
            NoiseSample = Noise(i : noiseend, j);
        
            %   If we reach the end
            if(length(NoiseSample) < W)
                Zeros = zeros(W, 1);
                Zeros(1 : length(NoiseSample), 1) = NoiseSample;
                NoiseSample = Zeros;
            end
        
            %   Windowed sample
            WindowedNoise = NoiseSample .* Window;
            
            %   Compute FFT and store it
            Transform = fft(WindowedNoise, FFTsize);
            %   Calculate power and store it
            Powers(count, j, :) = abs(Transform) .^ 2;
        end
    end
    
    %   For each channel
    for k = 1 : noisechannels
        %   And for each window analyzed
        for i = 1 : FFTsize
            %   Initialize
            NoisePowers(i, k) = Powers(1, k, i);
            %   Calculate the maximum of the powers of noise in that band
            for j = 1 : iterations
                if(Powers(j, k, i) > NoisePowers(i, k))
                    NoisePowers(i, k) = Powers(j, k, i);
                end
            end
            %   Maximum of both channels
            MaxPowers(i, 1) = max(NoisePowers(i, :));
        end
    end
   
    %    Represent results
    if(print_figures == true)
        figure;
        set(gcf, 'Name', strcat(filename, extension))
        for j = 1:noisechannels
            subplot(1, noisechannels, j);
            plot(NoisePowers(:, j));
            title(strcat('Channel no.', num2str(j)))
        end
    end
    
    %   Normalize
    MaxPowers = MaxPowers / max(MaxPowers(:, :));
    
    %   Write CSV file with the following format:
    %       Columns 1-last: Mean power for each audio channel
    csvwrite(strcat(output, filename, '.csv'), MaxPowers);
    
end

%   Time measure;
fprintf('\n');
toc;