/*! fili 0.0.1 29-11-2014 */
/*! Author: Florian Markert */
/*! License: MIT */
/* global define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var CalcCoeffs = function () {
    var self = {
      bq: function (params) {
        var coeffs = {};
        coeffs.z = [0, 0];
        coeffs.a = [];
        coeffs.b = [];
        var Q = params.Q,
          Fc = params.Fc,
          Fs = params.Fs;
        var w = 2 * Math.PI * Fc / Fs;
        var alpha = Math.sin(w) / (2 * Q);
        var cw = Math.cos(w);
        var a0 = 1 + alpha;

        coeffs.b.push((1 - cw) / (2 * a0));
        coeffs.b.push(2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        coeffs.a.push((-2 * cw) / a0);
        coeffs.a.push((1 - alpha) / a0);
        coeffs.k = 1;
        return coeffs;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = CalcCoeffs;
  } else {
    window.CalcCoeffs = CalcCoeffs;
    if (typeof define === 'function' && define.amd) {
      define(CalcCoeffs);
    }
  }
})(window);
;/* global define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  // params: array of biquad coefficient objects and z registers
  // stage structure e.g. {k:1, a:[1.1, -1.2], b:[0.3, -1.2, -0.4], z:[0, 0]}
  var Filter = function (filter) {
    var f = filter;
    var runStage = function (s, input) {
      var temp = input * s.k - s.a[0] * s.z[0] - s.a[1] * s.z[1];
      var out = s.b[0] * temp + s.b[1] * s.z[0] + s.b[2] * s.z[1];
      s.z[1] = s.z[0];
      s.z[0] = temp;
      return out;
    };

    var runFilter = function (input) {
      var out = input;
      var cnt = 0;
      for (cnt = 0; cnt < f.length; cnt++) {
        out = runStage(f[cnt], out);
      }
      return out;
    };

    var runMultiFilter = function (input) {
      var cnt = 0;
      var out = [];
      for (cnt = 0; cnt < input.length; cnt++) {
        out.push(runFilter(input[cnt]));
      }
      return out;
    };

    var self = {
      singleStep: function (input) {
        return runFilter(input);
      },
      multiStep: function (input) {
        return runMultiFilter(input);
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = Filter;
  } else {
    window.Filter = Filter;
    if (typeof define === 'function' && define.amd) {
      define(Filter);
    }
  }
})(window);
