/* global define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var IirCoeffs = function () {
    var preCalc = function (params, coeffs) {
      var Q = params.Q,
        Fc = params.Fc,
        Fs = params.Fs;
      var pre = {};
      var w = 2 * Math.PI * Fc / Fs;
      pre.alpha = Math.sin(w) / (2 * Q);
      pre.cw = Math.cos(w);
      pre.a0 = 1 + pre.alpha;
      coeffs.a0 = pre.a0;
      coeffs.a.push((-2 * pre.cw) / pre.a0);
      coeffs.a.push((1 - pre.alpha) / pre.a0);
      return pre;
    };
    var initCoeffs = function () {
      var coeffs = {};
      coeffs.z = [0, 0];
      coeffs.a = [];
      coeffs.b = [];
      return coeffs;
    };
    var self = {
      lowpass: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        if (params.preGain) {
          coeffs.k = (1 - p.cw) * 0.5;
          coeffs.b.push(1 / (p.a0));
        } else {
          coeffs.k = 1;
          coeffs.b.push((1 - p.cw) / (2 * p.a0));
        }
        coeffs.b.push(2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
      },
      highpass: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        if (params.preGain) {
          coeffs.k = (1 + p.cw) * 0.5;
          coeffs.b.push(1 / (p.a0));
        } else {
          coeffs.k = 1;
          coeffs.b.push((1 + p.cw) / (2 * p.a0));
        }
        coeffs.b.push(-2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
      },
      notch: function (params) {
        var coeffs = initCoeffs();
        preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push(1);
        coeffs.b.push(-2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
      },
      bandpass: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push(p.alpha * params.Q);
        coeffs.b.push(0);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
      },
      bandstop: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push(1);
        coeffs.b.push(-2 * p.cw);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = IirCoeffs;
  } else {
    window.IirCoeffs = IirCoeffs;
    if (typeof define === 'function' && define.amd) {
      define(IirCoeffs);
    }
  }
})(window);
