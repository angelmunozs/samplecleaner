function [ Output ] = smooth( Input, npoints )
%	Applies time smoothing to an Input audio file.
%   Parameters:
%       Input:      Unsmoothed signal
%       npoints:    number of neighboring data points on either side of
%                   each sample
%       Output:     Smoothed signal

    %   span
    span = 2 * npoints + 1;

    %   Only 1-dimensional signals
    s = size(Input);
    if(s(1) ~= 1 && s(2) ~= 1)
        Output = false;
        return
    end

    %   Initialize
    Output = Input;
    
    %   Do this for every value in [npoints, end - npoints]
    for i = 1:length(Input)
        if(i > npoints && i < length(Input) - npoints + 1)
            %   y(i) = 1/span * [y(i - N) + ... + y(i) + ... + y(i + N)]
            factor = 0;
            for j = -npoints : npoints
                factor = factor + Output(i + j);
            end
            Output(i) = 1/span * factor;
        end
    end

end

