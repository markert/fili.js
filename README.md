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
    characteristic: 'butterworth', // 'bessel' also possible
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
// does not change the state of the filter (no impact on z)
var simulation = filter.simulate([1,0,0,2,-1,0,0,1,5,0,0]);

// get the step response of the filter for 100 samples
// returns the filter output, max and min of the ripple
// filter.impulseResponse(100) does the same for an impulse.
var stepResponse = filter.stepResponse(100);
```

Limitations:
-   filters are calculated with bilinear transform. Fc must always be lower than Fs/4
-   filter orders over 3 are not supported, yet
-   only butterworth and bessel filters are implemented, yet
