/* global define, evaluatePhase */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var FirFilter = function (filter) {
    // note: coefficients are equal to input response
    var f = filter;
    var initZero = function (cnt) {
      var r = [];
      for (cnt = 0; cnt < cnt; cnt++) {
        r.push(0);
      }
      return r;
    };
    var z = initZero(f.length - 1);
    var cnt = 0;
    var doStep = function (input, d) {};

    var re = [];
    var im = [];
    var dft = function (coeffs) {
      re.length = 0;
      im.length = 0;
      var ret = [];
      var n = coeffs.length;
      var half = n / 2;
      var cnt = 0;
      var k = 0;
      var c = 2 * Math.PI / n;
      for (k = 0; k <= half; k++) {
        re[k] = 0;
        im[k] = 0;
      }
      for (k = 0; k <= half; k++) {
        for (cnt = 0; cnt < n; cnt++) {
          re[k] += coeffs[cnt] * Math.cos(c * k * cnt);
          im[k] -= coeffs[cnt] * Math.sin(c * k * cnt);
        }
        ret[k] = {};
        ret[k].magnitude = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
        ret[k].dBmagnitude = 20 * Math.log(ret[k].magnitude) * Math.LOG10E;
        if (re[k] === 0) {
          re[k] = -Number.MAX_VALUE;
        }
        ret[k].phase = Math.atan2(im[k], re[k]);
      }
      return ret;
    };
    var self = {
      response: function () {
        var input = [];
        var cnt = 0;
        for (cnt = 0; cnt < f.length * 2; cnt++) {
          if (f[cnt]) {
            input.push(f[cnt]);
          } else {
            input.push(0);
          }
        }
        var res = dft(input);
        evaluatePhase(res);
        return res;
      },
      singleStep: function (input) {

      },
      multiStep: function (input) {

      }
    };
    return self;
  };

  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = FirFilter;
  } else {
    window.FirFilter = FirFilter;
    if (typeof define === 'function' && define.amd) {
      define(FirFilter);
    }
  }
})(window);
