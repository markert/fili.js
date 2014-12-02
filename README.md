fili.js
=======

A digital filter library for javascript

Usage IIR Filters:

```javascript
//  Instance of a filter coefficient calculator
var iirCalculator = new CalcCascades();

// calculate filter coefficients
var iirFilterCoeffs = iirCalculator.lowpass({
    order: 3, // cascade 3 biquad filters
    characteristic: 'butterworth', // 'bessel' also possible
    Fs: 1000, // sampling frequency
    Fc: 100 // cutoff frequency
  });
  
// create a filter instance from the calculated coeffs
var iirFilter = new IirFilter(filterCoeffs);

// simulate the filter with 10 samples from a ramp
for (var cnt = 0; cnt < 10; cnt++) {
  console.log(iirFilter.singleStep(cnt));
}

// get the filter impact on magnitude, phase, unwrapped phase, phase delay and group delay
// returns array of n objects
// Fs = 1000 n = 100, so the array represents 0Hz, 10Hz, 20Hz....
var response = iirFilter.response(100);

// simulate filter with any input
// does not change the state of the filter (no impact on z)
var simulation = iirFilter.simulate([1,0,0,2,-1,0,0,1,5,0,0]);

// get the step response of the filter for 100 samples
// returns the filter output, max and min of the ripple
// filter.impulseResponse(100) does the same for an impulse.
var stepResponse = iirFilter.stepResponse(100);
```

Limitations:
-   iir filters are calculated with bilinear transform. Fc must always be lower than Fs/4
-   iir filter orders over 3 are not supported, yet
-   only butterworth and bessel iir filters are implemented, yet

Usage FIR Filters:   

```javascript
//  Instance of a filter coefficient calculator
var firCalculator = new firCoeffs();

// calculate filter coefficients
var firFilterCoeffs = firCalculator.lowpass({
    order: 100, // filter order
    Fs: 1000, // sampling frequency
    Fc: 100 // cutoff frequency
  });
  
// create a filter instance from the calculated coeffs
var firFilter = new FirFilter(filterCoeffs);


// get the filter impact on magnitude, phase, unwrapped phase, phase delay and group delay
// returns array of n objects
// Fs = 1000 n = 100, so the array represents 0Hz, 10Hz, 20Hz....
var response = FirFilter.response(100);
```
