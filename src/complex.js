/* global define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var Complex = function () {

    var self = {
      div: function (p, q) {
        var a = p.re,
          b = p.im,
          c = q.re,
          d = q.im;
        var n = (c * c + d * d);
        var x = {
          re: (a * c + b * d) / n,
          im: (b * c - a * d) / n
        };
        return x;
      },
      mul: function (p, q) {
        var a = p.re,
          b = p.im,
          c = q.re,
          d = q.im;
        var x = {
          re: (a * c - b * d),
          im: (a + b) * (c + d) - a * c - b * d
        };
        return x;
      },
      add: function (p, q) {
        var x = {
          re: p.re + q.re,
          im: p.im + q.im
        };
        return x;
      },
      sub: function (p, q) {
        var x = {
          re: p.re - q.re,
          im: p.im - q.im
        };
        return x;
      },
      phase: function (n) {
        return Math.atan2(n.im, n.re);
      },
      magnitude: function (n) {
        return Math.sqrt(n.re * n.re + n.im * n.im);
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = Complex;
  } else {
    window.Complex = Complex;
    if (typeof define === 'function' && define.amd) {
      define(Complex);
    }
  }
})(window);
