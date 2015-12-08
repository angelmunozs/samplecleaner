function [ Output ] = smooth_V1_CenterValues( Input, sm_bands )
%   Applies time smoothing to an Input audio file.
%   Parameters:
%       Input:      Unsmoothed signal
%       sm_bands:    number of neighboring data points on either side of
%                   each sample
%       Output:     Smoothed signal

    l = length(Input);
    span = 2 * sm_bands + 1;
    Output = Input;
    
    %   Do this for every value in [sm_bands, end - sm_bands]
    for i = 1 : l
        if(i > sm_bands && i < l - sm_bands + 1)
            %   y(i) = 1/span * [y(i - N) + ... + y(i) + ... + y(i + N)]
            factor = 0;
            for j = -sm_bands : sm_bands
                factor = factor + Input(i + j);
            end
            Output(i) = 1/span * factor;
        end
    end

end
