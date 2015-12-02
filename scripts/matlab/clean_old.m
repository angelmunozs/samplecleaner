%   Noise reduction using spectral noise gating.
%   Reads a CSV file containing results of noise analysis, and proceeds
%   to reduce the noise of a song.
%   
%   V1: Noise reduced, but time-smoothing and frequency smoothing not yet
%       implemented.
%
%   Parameters:
%       songpath (String):              Path for input dirty songs
%       noisepath (String):             Path for noise statistics files
%       outputpath (String):            Path for output clean song
%       songname (String):              Name of input dirty song
%       songextension (String):         Song extension
%       noisename (String):             Name of noise to reduce
%       noiseextension (String):        Noise extension
%       W (Integer):                    Window size, in samples
%       MSS (Integer):                  Number of non-overlapped samples
%                                       per window
%       FFTsize (Integer):              Size of FFT
%       ReduceLevel (Integer):          Gain to reduce noise, in dB (+)
%       FreqSmoothingBands (Integer):   Number of freq. smoothing bands
%       TimeSmoothingPerc (Integer):    Percentage allowed for two freqs.
%                                       to differ from consecutive windows
%
%   ======================================================================

%   Time measure;
tic;

%   Reset workspace
close all; clear variables; clc;

%   ======================================================================

%   Independent parameters
Version = '1';
songpath = '..\\Canciones sucias\\';
noisepath = 'profiles\\';
outputpath = '..\\Canciones limpias\\';
songname = 'Raphael - Yo soy aquel';
songextension = '.wav';
noisename = '70s3';
noiseextension = '.csv';

ReduceLevel = 20;
FreqSmoothingBands = 3;
TimeSmoothingPerc = 40;

%   ======================================================================

%   Read files (orignial audio, and noise)
[Song, Fs] = audioread(strcat(songpath, songname, songextension));
NoisePowers = csvread(strcat(noisepath, noisename, noiseextension));
NoisePowers = NoisePowers / 40;

%   Matrix dimensions
s = size(Song);
songchannels = s(2);
songlength = s(1);
n = size(NoisePowers);
FFTsize = n(1);
noisechannels = n(2);

%   Parameters depending on the previous ones
W = FFTsize;
MSS = W / 2;
ReduceLevelUN = 10 ^ ReduceLevel / 10;
OverlappAddBuffer = zeros(MSS, 1);
times = 0;

%   Window
Window = hann(W);

%   ======================================================================

%   Initialize
NewSong = zeros(songlength + W, songchannels);
BufferedSample = zeros(W, songchannels);

%   Print status
fprintf('Processing %d samples\n', songlength);

%   Process song
for j = 1 : songchannels
    
    fprintf('\n\tChannel no. %d\n', j);
    total = floor(songlength / MSS);
    count = 0;
    progress = round(100 * count / total);
    
    for i = 1 : MSS : songlength
        
        %   Print proggress
        count = count + 1;
        newprogress = round(100 * count / total);
        if(progress ~= newprogress)
            fprintf('\t\tProgreso: %d%%\n', newprogress);
        end
        progress = newprogress;
        
        %   Calculate end of song and noise
        songend = min(i + W - 1, songlength);
        
        %   Sample
        SongSample = Song(i : songend, j);
        position = 0;
        
        %   If we reached the end
        if (length(SongSample) < W)
            position = 1;
            %   Fill with zeros until size equals W
            Zeros = zeros(W, 1);
            Zeros(1 : length(SongSample), 1) = SongSample;
            SongSample = Zeros;
        elseif (i == 1)
            position = -1;
        end
        
        %   Windowed sample
        WindowedSample = SongSample .* Window;
        
        %   Compute FFT
        SongTransform = fft(WindowedSample, FFTsize);
        Power = abs(SongTransform) .^ 2;
        
        %   Calculate the power
        for k = 1 : length(Power)
            if Power(k) <= NoisePowers(k, j)
                times = times + 1;
                SongTransform(k) = SongTransform(k) / ReduceLevelUN;
            end
        end
        
        %   Inverse FFT
        ProcessedSample = ifft(SongTransform, FFTsize);
        ProcessedSample = ProcessedSample(1 : W);
        
        %   Save buffered sample
        BufferedSample = ProcessedSample;
        
        %   Overlapp/add method for piecing together the processed windows
        switch position
            case -1
                NewSong(i + W/2 : i + W - 1, j) = zeros(W/2, 1);
                NewSong(i + W : i + 3/2 * W - 1, j) = ...
                    ProcessedSample(1 + W/2 : 1 + W - 1, 1);
            case 1
                NewSong(i + W/2 : i + W - 1, j) = ...
                    NewSong(i + W/2 : i + W - 1, j) + ...
                    ProcessedSample(1 : 1 + W/2 - 1, 1);
                NewSong(i + W : i + 3/2 * W - 1, j) = zeros(W/2, 1);
            otherwise
                NewSong(i + W/2 : i + W - 1, j) = ...
                    NewSong(i + W/2 : i + W - 1, j) + ...
                    ProcessedSample(1 : 1 + W/2 - 1, 1);
                NewSong(i + W : i + 3/2 * W - 1, j) = ...
                    ProcessedSample(1 + W/2 : 1 + W - 1, 1);
        end
    end
end

%   Time smoothing
%   TODO

%   Save result
audiowrite(strcat(outputpath, songname, '_', ...
    noisename, '_', num2str(FFTsize), '_V', Version, songextension), ...
    NewSong, Fs);

%   Time measure
fprintf('\n');
toc;
fprintf('Noise gate applied %d times (%.3f%% of the analyzed bands).\n',...
    times, round(round(times * 1000 / ...
    ((songlength / MSS) * FFTsize))) / 1000);