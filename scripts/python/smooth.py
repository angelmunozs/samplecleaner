#	=====================================================================
#	Requirements
#	=====================================================================

import numpy as np

#	=====================================================================
#	Define functions
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
#	Test
#	=====================================================================

test_noise_removal = [1, 1, 0, 1, 1, 1, 0, 0, 1, 1]
test_noise_reduction = [1, 1, 0.01, 1, 1, 1, 0.01, 0.01, 1, 1]

print('test_noise_removal')
print test_noise_removal
print('smooth(test_noise_removal, 0)')
print smooth(test_noise_removal, 0)
print('smooth(test_noise_removal, 1)')
print smooth(test_noise_removal, 1)
print('smooth(test_noise_removal, 2)')
print smooth(test_noise_removal, 2)
print('')
print('test_noise_reduction')
print test_noise_reduction
print('smooth(test_noise_reduction, 0)')
print smooth(test_noise_reduction, 0)
print('smooth(test_noise_reduction, 1)')
print smooth(test_noise_reduction, 1)
print('smooth(test_noise_reduction, 2)')
print smooth(test_noise_reduction, 2)
