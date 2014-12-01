fili.js
=======

A digital filter library for javascript

Usage:

```javascript
//  Instance of a filter coefficient calculator
var coeffCalculator = new CalcCascades();

// calculate filter coefficients
var filterCoeffs = coeffCalculator.getCoefficients({
    order: 3, // cascade 3 biquad filters
    characteristic: 'butterworth',
    behavior: 'lowpass',
    Fs: 1000, // sampling frequency
    Fc: 100 // cutoff frequency
  });
  
// create a filter instance from the calculated coeffs
var filter = new Filter(filterCoeffs);

// simulate the filter with 10 samples from a ramp
for (var cnt = 0; cnt < 10; cnt++) {
  console.log(filter.singleStep(cnt));
}

// get the filter impact on magnitude, phase, unwrapped phase, phase delay and group delay
// returns array of n objects
// Fs = 1000 n = 100, so the array represents 0Hz, 10Hz, 20Hz....
var response = filter.response(100);

// simulate filter with any input
// useful to get impuls response
// does not change the state of the filter (no impact on z)
var simulation = filter.simulate([1,0,0,0,0,0,0,0,0,0,0]);
```

Limitations:
-   filters are calculated with bilinear transform. Fc must always be lower than Fs/4
-   filter orders over 3 are not supported, yet
-   only butterworth and bessel filters are implemented, yet
