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
      var theta = -Math.PI * (Fr / Fs) * 2;
      var b0 = {
        re: s.b[0],
        im: 0
      };
      var b1 = {
        re: s.b[1],
        im: 0
      };
      var b2 = {
        re: s.b[2],
        im: 0
      };
      var a1 = {
        re: s.a[0],
        im: 0
      };
      var a2 = {
        re: s.a[1],
        im: 0
      };
      var one = {
        re: 1,
        im: 0
      };
      var z = {
        re: Math.cos(theta),
        im: Math.sin(theta)
      };
      var p = complex.add(b0, complex.mul(z, complex.add(b1, complex.mul(b2, z))));
      var q = complex.add(one, complex.mul(z, complex.add(a1, complex.mul(a2, z))));
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
