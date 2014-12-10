fili.js
=======

A digital filter library for javascript

Generate IIR Filters:

IIR filters are composed of n Biquad filters.
Possible filters are:
-   lowpass
-   highpass
-   bandpass
-   bandstop
-   peak
-   lowshelf
-   highshelf

Note: for peak, lowshelf and highsheld a gain attribute must be defined
when generating the coefficients. Gain can be positive or negative
and represents the dB value for the peak or dip.

```javascript
//  Instance of a filter coefficient calculator
var iirCalculator = new CalcCascades();

// calculate filter coefficients
var iirFilterCoeffs = iirCalculator.lowpass({
    order: 3, // cascade 3 biquad filters
    characteristic: 'butterworth', // 'bessel' also possible
    Fs: 1000, // sampling frequency
    Fc: 100 // cutoff frequency / center frequency for bandpass, bandstop, peak
  });
  
// create a filter instance from the calculated coeffs
var iirFilter = new IirFilter(filterCoeffs);
```

Generate FIR Filters:   

FIR filter calculation is done with a windowed sinc function
Possible filters are:
-   lowpass
-   highpass
-   bandpass
-   bandstop

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
```

Run Filter

```javascript
// run the filter with 10 samples from a ramp
// returns single value
for (var cnt = 0; cnt < 10; cnt++) {
  console.log(filter.singleStep(cnt));
}

// run the filter from input array
// returns array
console.log(filter.multiStep([1,10,-5,3,1.112,17]));

// simulate the filter
// does not change the internal state
// returns array
console.log(filter.simulate([-3,-2,-1,5,6,33]));
```

Evaluate Filter:

```javascript
// get the filter impact on magnitude, phase, unwrapped phase, phase delay and group delay
// returns array of n objects
// Fs = 1000 n = 100, so the array represents 0Hz, 10Hz, 20Hz....
// returns array of objects
// {dBmagnitude: -4, groupDelay: 2, magnitude: 0, phase: -7, phaseDelay: 12, unwrappedPhase: 7}
var response = filter.response(100);

// get the filter impact on magnitude, phase, unwrapped phase, phase delay and group delay
// for a defined frequency
// returns one object
var responsePoint = filter.responsePoint({
    Fs: 1000,  // sampling frequency
    Fr: 123 // frequency of interest
  });
```

Evaluate stability:

```javascript

// initialize filter for testing
// note: changes internal state of filter -> create a new filter from
// the calculated coefficients for evaluation
var filterTester = new FilterTester(testFilter);

// check if filter is stable for the specified input range
// returns true for stable filter
var stable = filterTester.directedRandomStability({
    steps: 10000, // filter steps per test
    tests: 100, // numbers of tests (random, ramp, impulses, steps)
    offset: 5, // offset of input
    pp: 10, // peak to peak of input
    maxStable: 20, // values over this border will be considered as unstable 
    minStable: -10, // values under this border will be considered as unstable
    setup: 1000 // steps until initial setup of filter is complete
  });
```
