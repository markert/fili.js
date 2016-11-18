'use strict'

var FirCoeffs = function () {
  // Kaiser windowd filters
  // desired attenuation can be defined
  // better than windowd sinc filters
  var calcKImpulseResponse = function (params) {
    var Fs = params.Fs
    var Fa = params.Fa
    var Fb = params.Fb
    var o = params.order || 51
    var alpha = params.Att || 100
    var ino = function (val) {
      var d = 0
      var ds = 1
      var s = 1
      while (ds > s * 1e-6) {
        d += 2
        ds *= val * val / (d * d)
        s += ds
      }
      return s
    }

    if (o / 2 - Math.floor(o / 2) === 0) {
      o++
    }
    var Np = (o - 1) / 2
    var A = []
    var beta = 0
    var cnt = 0
    var inoBeta
    var ret = []

    A[0] = 2 * (Fb - Fa) / Fs
    for (cnt = 1; cnt <= Np; cnt++) {
      A[cnt] = (Math.sin(2 * cnt * Math.PI * Fb / Fs) - Math.sin(2 * cnt * Math.PI * Fa / Fs)) / (cnt * Math.PI)
    }
    // empirical coefficients
    if (alpha < 21) {
      beta = 0
    } else if (alpha > 50) {
      beta = 0.1102 * (alpha - 8.7)
    } else {
      beta = 0.5842 * Math.pow((alpha - 21), 0.4) + 0.07886 * (alpha - 21)
    }

    inoBeta = ino(beta)
    for (cnt = 0; cnt <= Np; cnt++) {
      ret[Np + cnt] = A[cnt] * ino(beta * Math.sqrt(1 - (cnt * cnt / (Np * Np)))) / inoBeta
    }
    for (cnt = 0; cnt < Np; cnt++) {
      ret[cnt] = ret[o - 1 - cnt]
    }
    return ret
  }

  // note: coefficients are equal to impulse response
  // windowd sinc filter
  var calcImpulseResponse = function (params) {
    var Fs = params.Fs
    var Fc = params.Fc
    var o = params.order
    var omega = 2 * Math.PI * Fc / Fs
    var cnt = 0
    var dc = 0
    var ret = []
    // sinc function is considered to be
    // the ideal impulse response
    // do an idft and use Hamming window afterwards
    for (cnt = 0; cnt <= o; cnt++) {
      if (cnt - o / 2 === 0) {
        ret[cnt] = omega
      } else {
        ret[cnt] = Math.sin(omega * (cnt - o / 2)) / (cnt - o / 2)
        // Hamming window
        ret[cnt] *= (0.54 - 0.46 * Math.cos(2 * Math.PI * cnt / o))
      }
      dc = dc + ret[cnt]
    }
    // normalize
    for (cnt = 0; cnt <= o; cnt++) {
      ret[cnt] /= dc
    }
    return ret
  }
  // invert for highpass from lowpass
  var invert = function (h) {
    var cnt
    for (cnt = 0; cnt < h.length; cnt++) {
      h[cnt] = -h[cnt]
    }
    h[(h.length - 1) / 2]++
    return h
  }
  var bs = function (params) {
    var lp = calcImpulseResponse({
      order: params.order,
      Fs: params.Fs,
      Fc: params.F2
    })
    var hp = invert(calcImpulseResponse({
      order: params.order,
      Fs: params.Fs,
      Fc: params.F1
    }))
    var out = []
    for (var i = 0; i < lp.length; i++) {
      out.push(lp[i] + hp[i])
    }
    return out
  }
  var self = {
    lowpass: function (params) {
      return calcImpulseResponse(params)
    },
    highpass: function (params) {
      return invert(calcImpulseResponse(params))
    },
    bandstop: function (params) {
      return bs(params)
    },
    bandpass: function (params) {
      return invert(bs(params))
    },
    kbFilter: function (params) {
      return calcKImpulseResponse(params)
    },
    available: function () {
      return ['lowpass', 'highpass', 'bandstop', 'bandpass', 'kbFilter']
    }
  }
  return self
}

module.exports = FirCoeffs
