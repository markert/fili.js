'use strict'

var {
  runMultiFilter,
  complex,
  evaluatePhase
} = require('./utils')

/**
 * Fir filter
 */
var FirFilter = function (filter) {
  // note: coefficients are equal to input response
  var f = filter
  var b = []
  var cnt = 0
  for (cnt = 0; cnt < f.length; cnt++) {
    b[cnt] = {
      re: f[cnt],
      im: 0
    }
  }

  var initZero = function (cnt) {
    var r = []
    var i
    for (i = 0; i < cnt; i++) {
      r.push(0)
    }
    return {
      buf: r,
      pointer: 0
    }
  }

  var z = initZero(f.length - 1)

  var doStep = function (input, d) {
    d.buf[d.pointer] = input
    var out = 0
    for (cnt = 0; cnt < d.buf.length; cnt++) {
      out += (f[cnt] * d.buf[(d.pointer + cnt) % d.buf.length])
    }
    d.pointer = (d.pointer + 1) % (d.buf.length)
    return out
  }

  var calcInputResponse = function (input) {
    var tempF = initZero(f.length - 1)
    return runMultiFilter(input, tempF, doStep)
  }

  var calcResponse = function (params) {
    var Fs = params.Fs
    var Fr = params.Fr
    // z = exp(j*omega*pi) = cos(omega*pi) + j*sin(omega*pi)
    // z^-1 = exp(-j*omega*pi)
    // omega is between 0 and 1. 1 is the Nyquist frequency.
    var theta = -Math.PI * (Fr / Fs) * 2
    var h = {
      re: 0,
      im: 0
    }
    for (var i = 0; i < f.length - 1; i++) {
      h = complex.add(h, complex.mul(b[i], {
        re: Math.cos(theta * i),
        im: Math.sin(theta * i)
      }))
    }
    var m = complex.magnitude(h)
    var res = {
      magnitude: m,
      phase: complex.phase(h),
      dBmagnitude: 20 * Math.log(m) * Math.LOG10E
    }
    return res
  }

  var self = {
    responsePoint: function (params) {
      return calcResponse(params)
    },
    response: function (resolution) {
      resolution = resolution || 100
      var res = []
      var cnt = 0
      var r = resolution * 2
      for (cnt = 0; cnt < resolution; cnt++) {
        res[cnt] = calcResponse({
          Fs: r,
          Fr: cnt
        })
      }
      evaluatePhase(res)
      return res
    },
    simulate: function (input) {
      return calcInputResponse(input)
    },
    singleStep: function (input) {
      return doStep(input, z)
    },
    multiStep: function (input, overwrite) {
      return runMultiFilter(input, z, doStep, overwrite)
    },
    reinit: function () {
      z = initZero(f.length - 1)
    }
  }
  return self
}

module.exports = FirFilter
