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
```
