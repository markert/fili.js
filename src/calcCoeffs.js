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
