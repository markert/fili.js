/* global define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  // implements a windowed sinc filter
  var FirCoeffs = function () {
    // note: coefficients are equal to impulse response
    var calcImpulseResponse = function (params) {
      var Fs = params.Fs,
        Fc = params.Fc,
        o = params.order;
      var omega = 2 * Math.PI * Fc / Fs;
      var cnt = 0;
      var dc = 0;
      var ret = [];
      // sinc function is considered to be
      // the ideal impulse response
      // do an idft and use Hamming window afterwards
      for (cnt = 0; cnt <= o; cnt++) {
        if (cnt - o / 2 === 0) {
          ret[cnt] = omega;
        } else {
          ret[cnt] = Math.sin(omega * (cnt - o / 2)) / (cnt - o / 2);
          // Hamming window                
          ret[cnt] *= (0.54 - 0.46 * Math.cos(2 * Math.PI * cnt / o));
        }
        dc = dc + ret[cnt];
      }
      // normalize
      for (cnt = 0; cnt <= o; cnt++) {
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
    var bs = function (params) {
      var lp = calcImpulseResponse({
        order: params.order,
        Fs: params.Fs,
        Fc: params.F2
      });
      var hp = invert(calcImpulseResponse({
        order: params.order,
        Fs: params.Fs,
        Fc: params.F1
      }));
      var out = [];
      for (var i = 0; i < lp.length; i++) {
        out.push(lp[i] + hp[i]);
      }
      return out;
    };
    var self = {
      lowpass: function (params) {
        return calcImpulseResponse(params);
      },
      highpass: function (params) {
        return invert(calcImpulseResponse(params));
      },
      bandstop: function (params) {
        return bs(params);
      },
      bandpass: function (params) {
        return invert(bs(params));
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
