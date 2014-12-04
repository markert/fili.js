/*! fili 0.0.5 04-12-2014 */
/*! Author: Florian Markert */
/*! License: MIT */
/* global IirCoeffs, define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var getCoeffs = new IirCoeffs();
  var table = {
    bessel: {
      q: [
        [0.57735026919],
        [0.805538281842, 0.521934581669],
        [1.02331395383, 0.611194546878, 0.510317824749]
      ],
      f: [
        [1.27201964951],
        [1.60335751622, 1.43017155999],
        [1.9047076123, 1.68916826762, 1.60391912877]
      ]
    },
    butterworth: {
      q: [
        [0.7071067811865475],
        [0.54, 1.31],
        [0.52, 0.7071067811865475, 1.93]
      ],
      f: [
        [1],
        [1, 1],
        [1, 1, 1]
      ]
    }
  };

  var calcCoeffs = function (params, behavior) {
    var filter = [];
    var cnt = 0;
    if (params.order > 3) {
      params.order = 3;
    }
    for (cnt = 0; cnt < params.order; cnt++) {
      filter.push(getCoeffs[behavior]({
        Fs: params.Fs,
        Fc: params.Fc * table[params.characteristic].f[params.order - 1][cnt],
        Q: table[params.characteristic].q[params.order - 1][cnt],
        preGain: params.preGain || false
      }));
    }
    return filter;
  };

  var CalcCascades = function () {
    var self = {
      lowpass: function (params) {
        return calcCoeffs(params, 'lowpass');
      },
      highpass: function (params) {
        return calcCoeffs(params, 'highpass');
      },
      notch: function (params) {
        return calcCoeffs(params, 'notch');
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = CalcCascades;
  } else {
    window.CalcCascades = CalcCascades;
    if (typeof define === 'function' && define.amd) {
      define(CalcCascades);
    }
  }
})(window);
;/* global define */
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
;/* global define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

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
;/* global define, evaluatePhase */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var FirFilter = function (filter) {
    // note: coefficients are equal to input response
    var f = filter;
    var initZero = function (cnt) {
      var r = [];
      var i;
      for (i = 0; i < cnt; i++) {
        r.push(0);
      }
      return {
        buf: r,
        pointer: 0
      };
    };
    var z = initZero(f.length - 1);
    var cnt = 0;
    var doStep = function (input, d) {
      d.buf[d.pointer] = input;
      var out = 0;
      for (cnt = 0; cnt < d.buf.length; cnt++) {
        out += (f[cnt] * d.buf[(d.pointer + cnt) % d.buf.length]);
      }
      d.pointer += 1 % d.buf.length;
      return out;
    };

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
        return doStep(input, z);
      },
      multiStep: function (input) {
        var out = [];
        for (cnt = 0; cnt < input.length; cnt++) {
          out.push(doStep(input[cnt], z));
        }
        return out;
      },
      reinit: function () {
        z = initZero(f.length - 1);
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
;/* global define */
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
        coeffs.b.push(1);
        coeffs.b.push(-2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
      },
      bandpass: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        coeffs.b.push(p.alpha * params.Q);
        coeffs.b.push(0);
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
;/* global define, Complex, evaluatePhase */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  // params: array of biquad coefficient objects and z registers
  // stage structure e.g. {k:1, a:[1.1, -1.2], b:[0.3, -1.2, -0.4], z:[0, 0]}
  var IirFilter = function (filter) {
    var f = filter;
    var cone = {
      re: 1,
      im: 0
    };
    var cf = [];
    for (var cnt = 0; cnt < f.length; cnt++) {
      cf[cnt] = {};
      var s = f[cnt];
      cf[cnt].b0 = {
        re: s.b[0],
        im: 0
      };
      cf[cnt].b1 = {
        re: s.b[1],
        im: 0
      };
      cf[cnt].b2 = {
        re: s.b[2],
        im: 0
      };
      cf[cnt].a1 = {
        re: s.a[0],
        im: 0
      };
      cf[cnt].a2 = {
        re: s.a[1],
        im: 0
      };
      cf[cnt].k = {
        re: s.k,
        im: 0
      };
    }
    var complex = new Complex();
    var runStage = function (s, input) {
      var temp = input * s.k - s.a[0] * s.z[0] - s.a[1] * s.z[1];
      var out = s.b[0] * temp + s.b[1] * s.z[0] + s.b[2] * s.z[1];
      s.z[1] = s.z[0];
      s.z[0] = temp;
      return out;
    };

    var runFilter = function (input, coeffs) {
      var out = input;
      var cnt = 0;
      for (cnt = 0; cnt < coeffs.length; cnt++) {
        out = runStage(coeffs[cnt], out);
      }
      return out;
    };

    var runMultiFilter = function (input, coeffs) {
      var cnt = 0;
      var out = [];
      for (cnt = 0; cnt < input.length; cnt++) {
        out.push(runFilter(input[cnt], coeffs));
      }
      return out;
    };

    var biquadResponse = function (params, s) {
      var Fs = params.Fs,
        Fr = params.Fr;
      // z = exp(j*omega*pi) = cos(omega*pi) + j*sin(omega*pi)
      // z^-1 = exp(-j*omega*pi)
      // omega is between 0 and 1. 1 is the Nyquist frequency.
      var theta = -Math.PI * (Fr / Fs) * 2;
      var z = {
        re: Math.cos(theta),
        im: Math.sin(theta)
      };
      // k * (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^⁻1 + a2*z^-2)
      var p = complex.mul(s.k, complex.add(s.b0, complex.mul(z, complex.add(s.b1, complex.mul(s.b2, z)))));
      var q = complex.add(cone, complex.mul(z, complex.add(s.a1, complex.mul(s.a2, z))));
      var h = complex.div(p, q);
      var res = {
        magnitude: complex.magnitude(h),
        phase: complex.phase(h)
      };
      return res;
    };

    var calcResponse = function (params) {
      var cnt = 0;
      var res = {
        magnitude: 1,
        phase: 0
      };
      for (cnt = 0; cnt < cf.length; cnt++) {
        var r = biquadResponse(params, cf[cnt]);
        // a cascade of biquads results in the multiplication of H(z)
        // H_casc(z) = H_0(z) * H_1(z) * ... * H_n(z)
        res.magnitude *= r.magnitude;
        // phase is wrapped -> unwrap before using
        res.phase += r.phase;
      }
      res.dBmagnitude = 20 * Math.log(res.magnitude) * Math.LOG10E;
      return res;
    };

    var reinit = function () {
      var tempF = [];
      for (var cnt = 0; cnt < f.length; cnt++) {
        tempF[cnt] = {
          a: [f[cnt].a[0], f[cnt].a[1]],
          b: [f[cnt].b[0], f[cnt].b[1], f[cnt].b[2]],
          k: f[cnt].k,
          z: [0, 0]
        };
      }
      return tempF;
    };

    var calcInputResponse = function (input) {
      var tempF = reinit();
      return runMultiFilter(input, tempF);
    };

    var predefinedResponse = function (def, length) {
      var ret = {};
      var input = [];
      var cnt = 0;
      for (cnt = 0; cnt < length; cnt++) {
        input.push(def(cnt));
      }
      ret.out = calcInputResponse(input);
      var maxFound = false;
      var minFound = false;
      for (cnt = 0; cnt < length - 1; cnt++) {
        if (ret.out[cnt] > ret.out[cnt + 1] && !maxFound) {
          maxFound = true;
          ret.max = {
            sample: cnt,
            value: ret.out[cnt]
          };
        }
        if (maxFound && !minFound && ret.out[cnt] < ret.out[cnt + 1]) {
          minFound = true;
          ret.min = {
            sample: cnt,
            value: ret.out[cnt]
          };
          break;
        }
      }
      return ret;
    };

    var self = {
      singleStep: function (input) {
        return runFilter(input, f);
      },
      multiStep: function (input) {
        return runMultiFilter(input, f);
      },
      simulate: function (input) {
        return calcInputResponse(input);
      },
      stepResponse: function (length) {
        return predefinedResponse(function () {
          return 1;
        }, length);
      },
      impulseResponse: function (length) {
        return predefinedResponse(function (val) {
          if (val === 0) {
            return 1;
          } else {
            return 0;
          }
        }, length);
      },
      responsePoint: function (params) {
        return calcResponse(params);
      },
      response: function (resolution) {
        var res = [];
        var cnt = 0;
        var r = resolution * 2;
        for (cnt = 0; cnt < resolution; cnt++) {
          res[cnt] = calcResponse({
            Fs: r,
            Fr: cnt
          });
        }
        evaluatePhase(res);
        return res;
      },
      reinit: function () {
        for (cnt = 0; cnt < f.length; cnt++) {
          f[cnt].z = [0, 0];
        }
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = IirFilter;
  } else {
    window.IirFilter = IirFilter;
    if (typeof define === 'function' && define.amd) {
      define(IirFilter);
    }
  }
})(window);
;/* global define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var TestFilter = function (filter) {
    var f = filter;

    var simData = [];
    var cnt;

    var randomValues = function (params) {
      for (cnt = 0; cnt < params.steps; cnt++) {
        simData.push(f.singleStep(((Math.random() - 0.5) * params.pp) + params.offset));
      }
    };

    var stepValues = function (params) {
      var max = params.offset + params.pp;
      var min = params.offset - params.pp;
      for (cnt = 0; cnt < params.steps; cnt++) {
        if ((cnt % 200) < 100) {
          simData.push(f.singleStep(max));
        } else {
          simData.push(f.singleStep(min));
        }
      }
    };

    var impulseValues = function (params) {
      var max = params.offset + params.pp;
      var min = params.offset - params.pp;
      for (cnt = 0; cnt < params.steps; cnt++) {
        if (cnt % 100 === 0) {
          simData.push(f.singleStep(max));
        } else {
          simData.push(f.singleStep(min));
        }
      }
    };

    var rampValues = function (params) {
      var max = params.offset + params.pp;
      var min = params.offset - params.pp;
      var val = min;
      var diff = (max - min) / 100;
      for (cnt = 0; cnt < params.steps; cnt++) {
        if (cnt % 200 < 100) {
          val += diff;
        } else {
          val -= diff;
        }
        simData.push(f.singleStep(val));
      }
    };

    var self = {
      randomStability: function (params) {
        f.reinit();
        simData.length = 0;
        randomValues(params);
        for (cnt = params.setup; cnt < simData.length; cnt++) {
          if (simData[cnt] > params.maxStable || simData[cnt] < params.minStable) {
            return simData[cnt];
          }
        }
        return true;
      },
      directedRandomStability: function (params) {
        f.reinit();
        simData.length = 0;
        var i;
        for (i = 0; i < params.tests; i++) {
          var choose = Math.random();
          if (choose < 0.25) {
            randomValues(params);
          } else if (choose < 0.5) {
            stepValues(params);
          } else if (choose < 0.75) {
            impulseValues(params);
          } else {
            rampValues(params);
          }
        }
        randomValues(params);
        for (cnt = params.setup; cnt < simData.length; cnt++) {
          if (simData[cnt] > params.maxStable || simData[cnt] < params.minStable) {
            return simData[cnt];
          }
        }
        return true;
      },
      evaluateBehavior: function (params) {

      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = TestFilter;
  } else {
    window.TestFilter = TestFilter;
    if (typeof define === 'function' && define.amd) {
      define(TestFilter);
    }
  }
})(window);
;  'use strict';

  var evaluatePhase = function (res) {
    var xcnt = 0;
    var cnt = 0;
    var pi = Math.PI;
    var tpi = 2 * pi;
    var phase = [];
    for (cnt = 0; cnt < res.length; cnt++) {
      phase.push(res[cnt].phase);
    }
    res[0].unwrappedPhase = res[0].phase;
    res[0].groupDelay = 0;
    // TODO: more sophisticated phase unwrapping needed
    for (cnt = 1; cnt < phase.length; cnt++) {
      var diff = phase[cnt] - phase[cnt - 1];
      if (diff > pi) {
        for (xcnt = cnt; xcnt < phase.length; xcnt++) {
          phase[xcnt] -= tpi;
        }
      } else if (diff < -pi) {
        for (xcnt = cnt; xcnt < phase.length; xcnt++) {
          phase[xcnt] += tpi;
        }
      }
      if (phase[cnt] < 0) {
        res[cnt].unwrappedPhase = -phase[cnt];
      } else {
        res[cnt].unwrappedPhase = phase[cnt];
      }

      res[cnt].phaseDelay = res[cnt].unwrappedPhase / (cnt / res.length);
      res[cnt].groupDelay = (res[cnt].unwrappedPhase - res[cnt - 1].unwrappedPhase) / (pi / res.length);
    }
    res[0].phaseDelay = res[1].phaseDelay;
    res[0].groupDelay = res[1].groupDelay;
  };
