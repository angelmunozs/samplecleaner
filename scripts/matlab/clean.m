%   Noise reduction using spectral noise gating.
%   Reads a CSV file containing results of noise analysis, and proceeds
%   to reduce the noise of a song.
%   
%   V1: Noise reduced, and time-smoothing and frequency smoothing applied.
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
%       SmoothingBands (Integer):       Number of smoothing bands
%       FFTsize (Integer):              Size of FFT
%       ReduceLevel (Integer):          Gain to reduce noise, in dB (+)
%
%   ======================================================================

%   Time measure;
tic;

%   Reset workspace
close all; clear variables;

%   ======================================================================

%   Independent parameters
Version = '2';
songpath = '/home/angel/samplecleaner/test/dirty/';
noisepath = '/home/angel/samplecleaner/files/noise/profiles/70/';
outputpath = '/home/angel/samplecleaner/test/clean/';
songname = 'Raphael - Yo soy aquel';
songextension = '.wav';
noisename = '1';
noiseextension = '.csv';

ReduceLevel = 20;
SmoothingBands = 3;

%   ======================================================================

%   Read files (orignial audio, and noise)
[Song, Fs] = audioread(strcat(songpath, songname, songextension));
NoisePowers = csvread(strcat(noisepath, noisename, noiseextension));

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
iterations = ceil(songlength / MSS);
NewSong = zeros(songlength + W, songchannels);
Gains = ones(songchannels, iterations, FFTsize);
Transforms = zeros(songchannels, iterations, FFTsize);

%   Print status
fprintf('Step 1: Taking statistics from %d samples...\n', songlength);

%   Process song
for j = 1 : songchannels
    
    fprintf('\n\tChannel no. %d\n', j);
    total = floor(songlength / MSS);
    count = 0;
    progress = 0;
    
    for i = 1 : MSS : songlength
        
        %   Print proggress
        count = count + 1;
        newprogress = floor((100 * count / total) / 10) * 10;
        if(progress ~= newprogress)
            fprintf('\t\tProgress: %d%%\n', newprogress);
        end
        progress = newprogress;
        
        %   Calculate end of song and noise
        songend = min(i + W - 1, songlength);
        
        %   Sample
        SongSample = Song(i : songend, j);
        
        %   If we reached the end
        if (length(SongSample) < W)
            %   Fill with zeros until size equals W
            Zeros = zeros(W, 1);
            Zeros(1 : length(SongSample), 1) = SongSample;
            SongSample = Zeros;
        end
        
        %   Windowed sample
        WindowedSample = SongSample .* Window;
        
        %   Compute FFT
        SampleTransform = fft(WindowedSample, FFTsize);
        %   Save into Transforms
        Transforms(j, count, :) = SampleTransform;
        %   Calculate power
        Power = abs(SampleTransform) .^ 2;
        
        %   Calculate the gains to apply later
        for k = 1 : FFTsize
            if Power(k) <= NoisePowers(k, j)
                times = times + 1;
                Gains(j, count, k) = 1 / ReduceLevelUN;
            end
        end
    end
end

%   Print status
fprintf('\nStep 2: Applying time smoothing to gains...\n');
fprintf('\tDoing %d operations\n\n', FFTsize * songchannels);

%   Time smoothing
for l = 1 : songchannels
    for m = 1 : FFTsize
        GainsToSmooth = Gains(l, :, m);
        GainsToSmooth = reshape(GainsToSmooth, [], iterations)';
        SmoothedGains = smooth(GainsToSmooth, SmoothingBands);
        Gains(l, :, m) = SmoothedGains;
    end
end

%   Print status
fprintf('\nStep 3: Applying frequency smoothing to gains...\n');
fprintf('\tDoing %d operations\n\n', iterations * songchannels);

%   Frequency smoothing
for l = 1 : songchannels
    for n = 1 : iterations
        GainsToSmooth = Gains(l, n, :);
        GainsToSmooth = reshape(GainsToSmooth, [], FFTsize)';
        SmoothedGains = smooth(GainsToSmooth, SmoothingBands);
        Gains(l, n, :) = SmoothedGains;
    end
end

%   Print status
fprintf('Step 4: Applying noise gate to %d samples...\n', songlength);

%   Process song
for j = 1 : songchannels
    
    fprintf('\n\tChannel no. %d\n', j);
    total = floor(songlength / MSS);
    count = 0;
    progress = 0;
    
    for i = 1 : MSS : songlength
        
        %   Print proggress
        count = count + 1;
        newprogress = floor((100 * count / total) / 10) * 10;
        if(progress ~= newprogress)
            fprintf('\t\tProgress: %d%%\n', newprogress);
        end
        progress = newprogress;

        %   Take stored values in arrays Transforms and Gains
        SampleTransform = Transforms(j, count, :);
        SampleTransform = reshape(SampleTransform, [], FFTsize)';
        TransformGains = Gains(j, count, :);
        TransformGains = reshape(TransformGains, [], FFTsize)';
        
        %   Apply gains to each band
        ProcessedTransform = SampleTransform .* TransformGains;
        
        %   Inverse FFT
        ProcessedSample = ifft(ProcessedTransform, FFTsize);
        ProcessedSample = ProcessedSample(1 : W);
        
        %   Overlapp/add method for piecing together the processed windows
        NewSong(i : i + W/2 - 1, j) = ...
            NewSong(i : i + W/2 - 1, j) + ...
            ProcessedSample(1 : 1 + W/2 - 1, 1);
        NewSong(i + W/2 : i + W - 1, j) = ...
            ProcessedSample(1 + W/2 : 1 + W - 1, 1);
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
