# fili

[![npm version](https://badge.fury.io/js/fili.svg)](http://badge.fury.io/js/fili)
[![Build Status](https://travis-ci.org/markert/fili.svg?branch=master)](https://travis-ci.org/markert/fili)

A digital filter library for JavaScript.

## Installation

```
$ npm install fili
```

## Usage

##### Node

```js
var Fili = require('fili');

var iirCalculator = new Fili.CalcCascades();
```

##### Browser

1. Copy `./dist/fili.min.js` into your working directory

2. Load script in your index.html

  ```html
  <script src="js/fili.min.js"></script>
  ```

3. Use `Fili` in your application

  ```js
  var iirCalculator = new Fili.CalcCascades();
  // ...
  ```

## API

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

Note: for peak, lowshelf and highshelf a gain attribute must be defined
when generating the coefficients. Gain can be positive or negative
and represents the dB value for the peak or dip.

```javascript
//  Instance of a filter coefficient calculator
var iirCalculator = new Fili.CalcCascades();

// calculate filter coefficients
var iirFilterCoeffs = iirCalculator.lowpass({
    order: 3, // cascade 3 biquad filters
    characteristic: 'butterworth', // 'bessel' also possible
    Fs: 1000, // sampling frequency
    Fc: 100, // cutoff frequency / center frequency for bandpass, bandstop, peak
    gain: 0, // gain for peak, lowshelf and highshelf
    preGain: false // adds one constant multiplication for highpass and lowpass
    // k = (1 + cos(omega)) * 0.5 / k = 1 with preGain == false
  });

// create a filter instance from the calculated coeffs
var iirFilter = new Fili.IirFilter(filterCoeffs);
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
var firCalculator = new Fili.firCoeffs();

// calculate filter coefficients
var firFilterCoeffs = firCalculator.lowpass({
    order: 100, // filter order
    Fs: 1000, // sampling frequency
    Fc: 100 // cutoff frequency
    // forbandpass and bandstop F1 and F2 must be provided instead of Fc
  });

// filter coefficients by Kaiser-Bessel window
var firFilterCoeffsK = firCalculator.kbFilter({
    order: 101, // filter order (must be odd)
    Fs: 1000, // sampling frequency
    Fa: 50, // rise, 0 for lowpass
    Fb: 100, // fall, Fs/2 for highpass
    Att: 100 // attenuation in dB
  });

// create a filter instance from the calculated coeffs
var firFilter = new Fili.FirFilter(filterCoeffs);
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
var filterTester = new Fili.FilterTester(testFilter);

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

## Test

```
$ make test
```

## License

MIT
