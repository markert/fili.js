/* global define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var FirCoeffs = function () {
    // note: coefficients are equal to input response
    var calcImpulseResponse = function (params) {
      var Fs = params.Fs,
        Fc = params.Fc,
        o = params.order;
      var omega = 2 * Math.PI * Fc / Fs;
      var cnt = 0;
      var dc = 0;
      var ret = [];
      for (cnt = 0; cnt < o; cnt++) {
        if (cnt - o / 2 === 0) {
          ret[cnt] = omega;
        } else {
          ret[cnt] = Math.sin(omega * (cnt - o / 2)) / (cnt - o / 2);
          // Hamming window                
          ret[cnt] *= (0.54 - 0.46 * Math.cos(2 * Math.PI * cnt / o));
        }
        dc = dc + ret[cnt];
      }
      for (cnt = 0; cnt < o; cnt++) {
        ret[cnt] /= dc;
      }
      return ret;
    };
    // invert for highpass from lowpass
    var invert = function (h) {
      var cnt;
      for (cnt = 0; cnt < h.length; cnt++) {
        h[cnt] = -h[cnt];
      }
      h[(h.length - 1) / 2] ++;
      return h;
    };
    var self = {
      lowpass: function (params) {
        return calcImpulseResponse(params);
      },
      highpass: function (params) {
        return invert(calcImpulseResponse(params));
      }
    };
    return self;
  };

  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = FirCoeffs;
  } else {
    window.FirCoeffs = FirCoeffs;
    if (typeof define === 'function' && define.amd) {
      define(FirCoeffs);
    }
  }
})(window);
