/* global define, Complex */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  // params: array of biquad coefficient objects and z registers
  // stage structure e.g. {k:1, a:[1.1, -1.2], b:[0.3, -1.2, -0.4], z:[0, 0]}
  var Filter = function (filter) {
    var f = filter;
    var complex = new Complex();
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

    var biquadResponse = function (params, s) {
      var Fs = params.Fs,
        Fr = params.Fr;
      var theta = Math.PI * Fr / Fs;
      var sin = Math.sin(theta);
      var sin2 = sin * sin;
      var x = (1 + sin2) / ((1 - sin2) - 4 * sin2);
      var y = 2 * sin / ((1 - sin2) - 4 * sin2);
      var p = {
        re: s.b[0] + s.b[1] / (1 + sin2) + s.b[2] * x,
        im: s.b[1] * sin / (1 - sin2) + s.b[2] * y
      };
      var q = {
        re: 1 + s.a[0] / (1 + sin2) + s.a[1] * x,
        im: s.a[0] * sin / (1 - sin2) + s.a[1] * y
      };
      var h = complex.div(p, q);
      var res = {
        magnitude: complex.magnitude(h),
        phase: complex.phase(h)
      };
      return res;
    };

    var self = {
      singleStep: function (input) {
        return runFilter(input);
      },
      multiStep: function (input) {
        return runMultiFilter(input);
      },
      response: function (params) {
        var cnt = 0;
        var res = {
          magnitude: 1,
          phase: 1
        };
        for (cnt = 0; cnt < f.length; cnt++) {
          var r = biquadResponse(params, f[cnt]);
          res.magnitude *= r.magnitude;
          res.phase *= r.phase;
        }
        return res;
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
