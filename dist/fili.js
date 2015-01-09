/*! fili 0.0.9 09-01-2015 */
/*! Author: Florian Markert */
/*! License: MIT */
/* global IirCoeffs, define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var getCoeffs = new IirCoeffs();
  var table = {
    // values from https://gist.github.com/endolith/4982787#file-all-values-txt
    bessel: {
      q: [
        [0.57735026919],
        [0.805538281842, 0.521934581669],
        [1.02331395383, 0.611194546878, 0.510317824749],
        [1.22566942541, 0.710852074442, 0.559609164796, 0.505991069397],
        [1.41530886916, 0.809790964842, 0.620470155556, 0.537552151325, 0.503912727276],
        [1.59465693507, 0.905947107025, 0.684008068137, 0.579367238641, 0.525936202016, 0.502755558204],
        [1.76552743493, 0.998998442993, 0.747625068271, 0.624777082395, 0.556680772868, 0.519027293158, 0.502045428643],
        [1.9292718407, 1.08906376917, 0.810410302962, 0.671382379377, 0.591144659703, 0.542678365981, 0.514570953471, 0.501578400482],
        [2.08691792612, 1.17637337045, 0.872034231424, 0.718163551101, 0.627261751983, 0.569890924765, 0.533371782078, 0.511523796759, 0.50125489338],
        [2.23926560629, 1.26117120993, 0.932397288146, 0.764647810579, 0.664052481472, 0.598921924986, 0.555480327396, 0.526848630061, 0.509345928377, 0.501021580965],
        [2.38695091667, 1.34368488961, 0.991497755204, 0.81060830488, 0.701011199665, 0.628878390935, 0.57943181849, 0.545207253735, 0.52208637596, 0.507736060535, 0.500847111042],
        [2.53048919562, 1.42411783481, 1.04937620183, 0.85593899901, 0.737862159044, 0.659265671705, 0.604435823473, 0.565352679646, 0.537608804383, 0.51849505465, 0.506508536474, 0.500715908905]
      ],
      f: [
        [1.27201964951],
        [1.60335751622, 1.43017155999],
        [1.9047076123, 1.68916826762, 1.60391912877],
        [2.18872623053, 1.95319575902, 1.8320926012, 1.77846591177],
        [2.45062684305, 2.20375262593, 2.06220731793, 1.98055310881, 1.94270419166],
        [2.69298925084, 2.43912611431, 2.28431825401, 2.18496722634, 2.12472538477, 2.09613322542],
        [2.91905714471, 2.66069088948, 2.49663434571, 2.38497976939, 2.30961462222, 2.26265746534, 2.24005716132],
        [3.13149167404, 2.87016099416, 2.69935018044, 2.57862945683, 2.49225505119, 2.43227707449, 2.39427710712, 2.37582307687],
        [3.33237300564, 3.06908580184, 2.89318259511, 2.76551588399, 2.67073340527, 2.60094950474, 2.55161764546, 2.52001358804, 2.50457164552],
        [3.52333123464, 3.25877569704, 3.07894353744, 2.94580435024, 2.84438325189, 2.76691082498, 2.70881411245, 2.66724655259, 2.64040228249, 2.62723439989],
        [3.70566068548, 3.44032173223, 3.2574059854, 3.11986367838, 3.01307175388, 2.92939234605, 2.86428726094, 2.81483068055, 2.77915465405, 2.75596888377, 2.74456638588],
        [3.88040469682, 3.61463243697, 3.4292654707, 3.28812274966, 3.17689762788, 3.08812364257, 3.01720732972, 2.96140104561, 2.91862858495, 2.88729479473, 2.8674198668, 2.8570800015]
      ]
    }
  };

  var calcCoeffs = function (params, behavior) {
    var filter = [];
    var cnt = 0;
    if (params.order > 12) {
      params.order = 12;
    }
    for (cnt = 0; cnt < params.order; cnt++) {
      var q, f, fd;
      if (params.characteristic === 'butterworth') {
        q = 0.5 / (Math.sin((Math.PI / (params.order * 2)) * (cnt + 0.5)));
        f = 1;
      } else {
        q = table[params.characteristic].q[params.order - 1][cnt];
        f = table[params.characteristic].f[params.order - 1][cnt];
      }
      if (behavior === 'highpass') {
        fd = params.Fc / f;
      } else {
        fd = params.Fc * f;
      }
      filter.push(getCoeffs[behavior]({
        Fs: params.Fs,
        Fc: fd,
        Q: q,
        BW: params.BW || 0,
        gain: params.gain || 0,
        preGain: params.preGain || false
      }));
    }
    return filter;
  };

  var initCalcCoeffs = function (behavior) {
    return function (params) {
      return calcCoeffs(params, behavior);
    };
  };

  var self = {};
  var CalcCascades = function () {
    for (var k in getCoeffs) {
      self[k] = initCalcCoeffs(k);
    }
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
;/* global define, evaluatePhase, runMultiFilter, complex */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var FirFilter = function (filter) {
    // note: coefficients are equal to input response
    var f = filter;
    var b = [];
    var cnt = 0;
    for (cnt = 0; cnt < f.length; cnt++) {
      b[cnt] = {
        re: f[cnt],
        im: 0
      };
    }
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
    var doStep = function (input, d) {
      d.buf[d.pointer] = input;
      var out = 0;
      for (cnt = 0; cnt < d.buf.length; cnt++) {
        out += (f[cnt] * d.buf[(d.pointer + cnt) % d.buf.length]);
      }
      d.pointer = (d.pointer + 1) % (d.buf.length);
      return out;
    };

    var calcInputResponse = function (input) {
      var tempF = initZero(f.length - 1);
      return runMultiFilter(input, tempF, doStep);
    };

    var calcResponse = function (params) {
      var Fs = params.Fs,
        Fr = params.Fr;
      // z = exp(j*omega*pi) = cos(omega*pi) + j*sin(omega*pi)
      // z^-1 = exp(-j*omega*pi)
      // omega is between 0 and 1. 1 is the Nyquist frequency.
      var theta = -Math.PI * (Fr / Fs) * 2;
      var h = {
        re: 0,
        im: 0
      };
      for (var i = 0; i < f.length - 1; i++) {
        h = complex.add(h, complex.mul(b[i], {
          re: Math.cos(theta * i),
          im: Math.sin(theta * i)
        }));
      }
      var m = complex.magnitude(h);
      var res = {
        magnitude: m,
        phase: complex.phase(h),
        dBmagnitude: 20 * Math.log(m) * Math.LOG10E
      };
      return res;
    };
    var self = {
      responsePoint: function (params) {
        return calcResponse(params);
      },
      response: function (resolution) {
        resolution = resolution || 100;
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
      simulate: function (input) {
        return calcInputResponse(input);
      },
      singleStep: function (input) {
        return doStep(input, z);
      },
      multiStep: function (input, overwrite) {
        return runMultiFilter(input, z, doStep, overwrite);
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
      if (params.BW) {
        pre.alpha = Math.sin(w) * Math.sinh(Math.log(2) / 2 * params.BW * w / Math.sin(w));
      } else {
        pre.alpha = Math.sin(w) / (2 * Q);
      }
      pre.cw = Math.cos(w);
      pre.a0 = 1 + pre.alpha;
      coeffs.a0 = pre.a0;
      coeffs.a.push((-2 * pre.cw) / pre.a0);
      coeffs.a.push((1 - pre.alpha) / pre.a0);
      return pre;
    };
    var preCalcGain = function (params) {
      var Q = params.Q,
        Fc = params.Fc,
        Fs = params.Fs;
      var pre = {};
      var w = 2 * Math.PI * Fc / Fs;
      pre.alpha = Math.sin(w) / (2 * Q);
      pre.cw = Math.cos(w);
      pre.A = Math.pow(10, params.gain / 40);
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
      // Bessel-Thomson: H(s) = 3/(s^2+3*s+3)
      lowpassBT: function (params) {
        var coeffs = initCoeffs();
        params.Q = 1;
        coeffs.wp = Math.tan((2 * Math.PI * params.Fc) / (2 * params.Fs));
        coeffs.wp2 = coeffs.wp * coeffs.wp;
        if (params.BW) {
          delete params.BW;
        }
        coeffs.k = 1;
        coeffs.a0 = 3 * coeffs.wp + 3 * coeffs.wp2 + 1;
        coeffs.b.push(3 * coeffs.wp2 * params.Q / coeffs.a0);
        coeffs.b.push(2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        coeffs.a.push((6 * coeffs.wp2 - 2) / coeffs.a0);
        coeffs.a.push((3 * coeffs.wp2 - 3 * coeffs.wp + 1) / coeffs.a0);
        return coeffs;
      },
      highpassBT: function (params) {
        var coeffs = initCoeffs();
        params.Q = 1;
        coeffs.wp = Math.tan((2 * Math.PI * params.Fc) / (2 * params.Fs));
        coeffs.wp2 = coeffs.wp * coeffs.wp;
        if (params.BW) {
          delete params.BW;
        }
        coeffs.k = 1;
        coeffs.a0 = coeffs.wp + coeffs.wp2 + 3;
        coeffs.b.push(3 * params.Q / coeffs.a0);
        coeffs.b.push(2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        coeffs.a.push((2 * coeffs.wp2 - 6) / coeffs.a0);
        coeffs.a.push((coeffs.wp2 - coeffs.wp + 3) / coeffs.a0);
        return coeffs;
      },
      /*
       * Formulas from http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
       */
      // H(s) = 1 / (s^2 + s/Q + 1)
      lowpass: function (params) {
        var coeffs = initCoeffs();
        if (params.BW) {
          delete params.BW;
        }
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
      // H(s) = s^2 / (s^2 + s/Q + 1)
      highpass: function (params) {
        var coeffs = initCoeffs();
        if (params.BW) {
          delete params.BW;
        }
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
      // H(s) = (s^2 - s/Q + 1) / (s^2 + s/Q + 1
      allpass: function (params) {
        var coeffs = initCoeffs();
        if (params.BW) {
          delete params.BW;
        }
        var p = preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push((1 - p.alpha) / p.a0);
        coeffs.b.push(-2 * p.cw / p.a0);
        coeffs.b.push((1 + p.alpha) / p.a0);
        return coeffs;
      },
      // H(s) = s / (s^2 + s/Q + 1)
      bandpassQ: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push(p.alpha * params.Q / p.a0);
        coeffs.b.push(0);
        coeffs.b.push(-coeffs.b[0]);
        return coeffs;
      },
      // H(s) = (s/Q) / (s^2 + s/Q + 1)
      bandpass: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push(p.alpha / p.a0);
        coeffs.b.push(0);
        coeffs.b.push(-coeffs.b[0]);
        return coeffs;
      },
      // H(s) = (s^2 + 1) / (s^2 + s/Q + 1)
      bandstop: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        coeffs.k = 1;
        coeffs.b.push(1 / p.a0);
        coeffs.b.push(-2 * p.cw / p.a0);
        coeffs.b.push(coeffs.b[0]);
        return coeffs;
      },
      // H(s) = (s^2 + s*(A/Q) + 1) / (s^2 + s/(A*Q) + 1)
      peak: function (params) {
        var coeffs = initCoeffs();
        var p = preCalcGain(params);
        coeffs.k = 1;
        coeffs.a0 = 1 + p.alpha / p.A;
        coeffs.a.push(-2 * p.cw / coeffs.a0);
        coeffs.a.push((1 - p.alpha / p.A) / coeffs.a0);
        coeffs.b.push((1 + p.alpha * p.A) / coeffs.a0);
        coeffs.b.push(-2 * p.cw / coeffs.a0);
        coeffs.b.push((1 - p.alpha * p.A) / coeffs.a0);
        return coeffs;
      },
      // H(s) = A * (s^2 + (sqrt(A)/Q)*s + A)/(A*s^2 + (sqrt(A)/Q)*s + 1)
      lowshelf: function (params) {
        var coeffs = initCoeffs();
        if (params.BW) {
          delete params.BW;
        }
        var p = preCalcGain(params);
        coeffs.k = 1;
        var sa = 2 * Math.sqrt(p.A) * p.alpha;
        coeffs.a0 = (p.A + 1) + (p.A - 1) * p.cw + sa;
        coeffs.a.push((-2 * ((p.A - 1) + (p.A + 1) * p.cw)) / coeffs.a0);
        coeffs.a.push(((p.A + 1) + (p.A - 1) * p.cw - sa) / coeffs.a0);
        coeffs.b.push((p.A * ((p.A + 1) - (p.A - 1) * p.cw + sa)) / coeffs.a0);
        coeffs.b.push((2 * p.A * ((p.A - 1) - (p.A + 1) * p.cw)) / coeffs.a0);
        coeffs.b.push((p.A * ((p.A + 1) - (p.A - 1) * p.cw - sa)) / coeffs.a0);
        return coeffs;
      },
      // H(s) = A * (A*s^2 + (sqrt(A)/Q)*s + 1)/(s^2 + (sqrt(A)/Q)*s + A)
      highshelf: function (params) {
        var coeffs = initCoeffs();
        if (params.BW) {
          delete params.BW;
        }
        var p = preCalcGain(params);
        coeffs.k = 1;
        var sa = 2 * Math.sqrt(p.A) * p.alpha;
        coeffs.a0 = (p.A + 1) - (p.A - 1) * p.cw + sa;
        coeffs.a.push((2 * ((p.A - 1) - (p.A + 1) * p.cw)) / coeffs.a0);
        coeffs.a.push(((p.A + 1) - (p.A - 1) * p.cw - sa) / coeffs.a0);
        coeffs.b.push((p.A * ((p.A + 1) + (p.A - 1) * p.cw + sa)) / coeffs.a0);
        coeffs.b.push((-2 * p.A * ((p.A - 1) + (p.A + 1) * p.cw)) / coeffs.a0);
        coeffs.b.push((p.A * ((p.A + 1) + (p.A - 1) * p.cw - sa)) / coeffs.a0);
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
;/* global define, evaluatePhase, runMultiFilter, complex */
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
    var cc = [];
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
      cc[cnt] = {};
      cc[cnt].b1 = s.b[1] / s.b[0];
      cc[cnt].b2 = s.b[2] / s.b[0];
      cc[cnt].a1 = s.a[0];
      cc[cnt].a2 = s.a[1];
    }
    var runStage = function (s, input) {
      var temp = input * s.k - s.a[0] * s.z[0] - s.a[1] * s.z[1];
      var out = s.b[0] * temp + s.b[1] * s.z[0] + s.b[2] * s.z[1];
      s.z[1] = s.z[0];
      s.z[0] = temp;
      return out;
    };

    var doStep = function (input, coeffs) {
      var out = input;
      var cnt = 0;
      for (cnt = 0; cnt < coeffs.length; cnt++) {
        out = runStage(coeffs[cnt], out);
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
      return runMultiFilter(input, tempF, doStep);
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

    var getComplRes = function (n1, n2) {
      var innerSqrt = Math.pow(n1 / 2, 2) - n2;
      if (innerSqrt < 0) {
        return [{
          re: -n1 / 2,
          im: Math.sqrt(Math.abs(innerSqrt))
        }, {
          re: -n1 / 2,
          im: -Math.sqrt(Math.abs(innerSqrt))
        }];
      } else {
        return [{
          re: -n1 / 2 + Math.sqrt(innerSqrt),
          im: 0
        }, {
          re: -n1 / 2 - Math.sqrt(innerSqrt),
          im: 0
        }];
      }
    };

    var getPZ = function () {
      var res = [];
      for (var cnt = 0; cnt < cc.length; cnt++) {
        res[cnt] = {};
        res[cnt].z = getComplRes(cc[cnt].b1, cc[cnt].b2);
        res[cnt].p = getComplRes(cc[cnt].a1, cc[cnt].a2);
      }
      return res;
    };

    var self = {
      singleStep: function (input) {
        return doStep(input, f);
      },
      multiStep: function (input, overwrite) {
        return runMultiFilter(input, f, doStep, overwrite);
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
        resolution = resolution || 100;
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
      polesZeros: function () {
        return getPZ();
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
;/**************************************************************************
 * Parks-McClellan algorithm for FIR filter design (javascript version)
 *
 *-------------------------------------------------
 *  Copyright (c) 2011 Peter Isza (peter.isza@gmail.com)
 *
 *  This library is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Library General Public
 *  License as published by the Free Software Foundation; either
 *  version 2 of the License, or (at your option) any later version.
 *
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Library General Public License for more details.
 *
 *  You should have received a copy of the GNU Library General Public
 *  License along with this library; if not, write to the Free
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 *	Here it is: http://t-filter.appspot.com/fir/GPL
 *
 *  This code is loosely based on the work of
 *  Jake Janovetz (janovetz@uiuc.edu).
 *
 *************************************************************************/

/*
 *
 * This code is a huge unstructured mess. It would need a major refactoring.
 * If you are interested in developing t-filter, just drop me an email to
 * peter.isza@gmail.com, and I will allocate time to get it in a better shape
 * before someone touches it.
 *
 */

function getOverlappingBands(spec) {
  var last = -1;
  for (var i in spec.bands) {
    var b = spec.bands[i];
    if (last >= b.startHz)
      return {
        x1: last,
        x2: b.startHz
      };
    last = b.stopHz;
  }
  return false;
}

function getLinearFreq(spec, w) {
  for (var i in spec.bands) {
    var b = spec.bands[i];
    if (w < b.stop - b.start)
      return b.start + w;
    else
      w -= b.stop - b.start;
  }
}

function initFrequencies(spec) {
  spec.sum_bands = 0.0;

  spec.frequencies = new Array();

  for (var i in spec.bands) {
    var b = spec.bands[i];
    spec.sum_bands += b.stop - b.start;
  }

  var step = spec.sum_bands / (spec.r + 2);

  for (i = 0; i < spec.r + 1; i++)
    spec.frequencies[i] = getLinearFreq(spec, step * (i + 1));
}

function getDesiredGain(spec, w) {
  for (var i in spec.bands) {
    var b = spec.bands[i];
    if (w >= b.start && w <= b.stop)
      return (spec.numtaps % 2 != 0) ? b.gain : b.gain / Math.cos(w * Math.PI / 2);
  }
  return 0;
}

function getBand(spec, w) {
  for (var i in spec.bands) {
    var b = spec.bands[i];
    if (w >= b.start && w <= b.stop)
      return b;
  }
  return null;
}

function isInLimits(spec, w) {
  for (var i in spec.bands) {
    var b = spec.bands[i];
    if (w >= b.start && w <= b.stop) {
      var gain = Math.abs(getActualGain(spec, w));
      //alert(gain + " <" + b.lower + ".." + b.upper + ">");

      if (b.gain != 0)
        return gain >= b.lower && gain <= b.upper;
      else
        return gain <= b.upper;
    }
  }

  return true;
}

function getWeight(spec, w) {
  for (var i in spec.bands) {
    var b = spec.bands[i];
    if (w >= b.start && w <= b.stop)
      return (spec.numtaps % 2 != 0) ? b.weight : b.weight * Math.cos(w * Math.PI / 2);
  }
  return 0.0;
}

// performs a barycentric Lagrange interpolation based on the 
// precalculated variables and the delta property
function getActualGain(spec, w) {
  var numerator = 0,
    denominator = 0;
  var cosw = Math.cos(w * Math.PI);

  for (var i in spec.frequencies) {
    var c = cosw - spec.x[i];
    if (Math.abs(c) < 1e-12) {
      numerator = spec.y[i];
      denominator = 1;
      break;
    }
    c = spec.dn[i] / c;
    denominator += c;
    numerator += c * spec.y[i];
  }

  return numerator / denominator;
}

function getPreciseError(spec, w) {
  var numerator = 0,
    denominator = 0,
    numerator2 = 0;
  var negarray = new Array();
  var posarray = new Array();
  var cosw = Math.cos(w * Math.PI);

  for (var i in spec.frequencies) {
    var c = cosw - spec.x[i];
    if (Math.abs(c) < 1e-10)
      return spec.dy[i];

    c = 1 / c / spec.di[i];

    denominator += c;
    var tmp = -c * spec.dy[i];
    if (tmp > 0)
      posarray.push(tmp);
    else
      negarray.push(-tmp);

    tmp = c * (spec.d[i] - getDesiredGain(spec, w));

    if (tmp > 0)
      posarray.push(tmp);
    else
      negarray.push(-tmp);
  }

  negarray.sort(function (a, b) {
    return Math.abs(a) > Math.abs(b) ? 1 : -1;
  });
  posarray.sort(function (a, b) {
    return Math.abs(a) > Math.abs(b) ? 1 : -1;
  });

  var pos = 0,
    neg = 0;
  for (i in posarray)
    pos += posarray[i];
  for (i in negarray)
    neg -= negarray[i];

  return -getWeight(spec, w) * ((neg + pos) / denominator);
}

function getDecibel(x) {
  return 20 * Math.log(x) / Math.log(10);
}

function getMagnitude(spec, w) {
  var x = Math.abs(getActualGain(spec, w));
  if (spec.numtaps % 2 == 0)
    x *= Math.cos(w * Math.PI / 2);

  return getDecibel(x);
}

function getTaps(spec) {
  var taps = new Array();
  var h = new Array();

  for (var i = 0; i <= Math.floor(spec.numtaps / 2); i++) {
    if (spec.numtaps % 2 == 0)
      c = Math.cos(Math.PI * i / spec.numtaps);
    else
      c = 1;
    taps[i] = getActualGain(spec, i * 2.0 / spec.numtaps) * c;
  }
  console.log("taps: " + JSON.stringify(taps));
  var M = (spec.numtaps - 1.0) / 2.0;

  if (spec.numtaps % 2 == 0) {
    for (var i = 0; i < spec.numtaps; i++) {
      var val = taps[0];
      var x = Math.PI * 2 * (i - M) / spec.numtaps;
      for (var k = 1; k <= spec.numtaps / 2 - 1; k++)
        val += 2.0 * taps[k] * Math.cos(x * k);
      h[i] = val / spec.numtaps;
    }
  } else {
    //		var tmpstr = "";
    for (var i = 0; i < spec.numtaps; i++) {
      var val = taps[0];
      var x = Math.PI * 2 * (i - M) / spec.numtaps;
      for (var k = 1; k <= M; k++) {
        //				tmpstr += (2.0 * taps[k] * Math.cos(x*k)) + " ";
        val += 2.0 * taps[k] * Math.cos(x * k);
      }
      //			tmpstr += "\n";
      h[i] = val / spec.numtaps;
    }
    //		console.log(tmpstr);
  }

  return h;
}

function getHiResTaps(spec, numpoints) {
  var taps = new Array();
  var h = new Array();

  for (var i = 0; i <= Math.floor(spec.numtaps / 2); i++) {
    if (spec.numtaps % 2 == 0)
      c = Math.cos(Math.PI * i / spec.numtaps);
    else
      c = 1;
    taps[i] = getActualGain(spec, i * 2.0 / spec.numtaps) * c;
  }
  var M = (spec.numtaps - 1.0) / 2.0;

  if (spec.numtaps % 2 == 0) {
    for (var i = 0; i < numpoints; i++) {
      var val = taps[0];
      var fi = i * (spec.numtaps - 1) / numpoints;
      var x = Math.PI * 2 * (fi - M) / spec.numtaps;
      for (var k = 1; k <= spec.numtaps / 2 - 1; k++)
        val += 2.0 * taps[k] * Math.cos(x * k);
      h[fi] = val / spec.numtaps;
    }
  } else {
    for (var i = 0; i < numpoints; i++) {
      var val = taps[0];
      var fi = i * (spec.numtaps - 1) / numpoints;
      var x = Math.PI * 2 * (fi - M) / spec.numtaps;
      for (var k = 1; k <= M; k++)
        val += 2.0 * taps[k] * Math.cos(x * k);
      h[fi] = val / spec.numtaps;
    }
  }

  return h;
}

function getError(spec, w) {
  return getWeight(spec, w) * (getDesiredGain(spec, w) - getActualGain(spec, w));
}

// calculates the desired amplitude of the alternation (delta)
// based on the corner frequencies
// it also precalculetes some temporary variables
function calcDelta(spec) {
  spec.x = new Array();
  spec.y = new Array();
  spec.di = new Array();
  spec.dn = new Array();
  var numerator = 0,
    denominator = 0;

  for (var i in spec.frequencies)
    spec.x[i] = Math.cos(spec.frequencies[i] * Math.PI);

  for (var i in spec.x) {
    spec.di[i] = 1.0;
    for (var j in spec.x)
      if (i != j)
        spec.di[i] *= (spec.x[j] - spec.x[i]);
    spec.dn[i] = 1 / spec.di[i];
  }

  var sign = 1;
  for (var i in spec.frequencies) {
    numerator += getDesiredGain(spec, spec.frequencies[i]) * spec.dn[i];
    denominator += sign / getWeight(spec, spec.frequencies[i]) * spec.dn[i];
    sign = -sign;
  }

  spec.delta = numerator / denominator;

  /*if(Math.abs(spec.delta) < 1e-10)
		if(spec.delta >= 0)
			spec.delta = 1e-10
		else
			spec.delta = -1e-10;*/

  spec.dy = new Array();
  spec.w = new Array();
  spec.d = new Array();
  sign = 1;
  for (var i in spec.frequencies) {
    spec.w[i] = getWeight(spec, spec.frequencies[i])
    spec.dy[i] = sign * spec.delta / spec.w[i];
    spec.d[i] = getDesiredGain(spec, spec.frequencies[i]);
    spec.y[i] = spec.d[i] - spec.dy[i];

    sign = -sign;
  }
}

function calcMaxError(extrema) {
  var maxerror = 0;
  for (var i in extrema)
    if (Math.abs(extrema[i].error) > maxerror) {
      maxerror = Math.abs(extrema[i].error);
    }
  return maxerror;
}

function makeAlternating(firstOneSign, candidates, spec) {
  while (candidates.length > 0 && candidates[0].error * firstOneSign < 0)
    candidates.splice(0, 1);

  var req_length = spec.r + 1;
  while (candidates.length > req_length) {
    for (var i = 1; i < candidates.length; i++) {
      if (candidates[i].error * candidates[i - 1].error >= 0) {
        if (Math.abs(candidates[i].error) > Math.abs(candidates[i - 1].error))
          candidates.splice(i - 1, 1);
        else
          candidates.splice(i, 1);
        i--;
      }
    }
    if (candidates.length == req_length + 1) {
      var last = candidates.length - 1;
      if (Math.abs(candidates[0].error) > Math.abs(candidates[last].error))
        candidates.splice(last, 1);
      else
        candidates.splice(0, 1);
    } else if (candidates.length > req_length) {
      var min = 0;
      for (var i in candidates)
        if (Math.abs(candidates[i].error) < Math.abs(candidates[min].error))
          min = i;
      candidates.splice(min, 1);
    }
  }

  if (candidates.length < req_length)
    return -1;

  return calcMaxError(candidates);
}

function getExtrema(spec, resolution) {
  var step = spec.sum_bands / (resolution + 1);

  spec.extrema = new Array();
  var candidates = new Array();

  var E = new Array();
  var F = new Array();

  for (var i = 0; i < resolution; i++) {
    F[i] = getLinearFreq(spec, spec.sum_bands * (i + 1.0) / (resolution + 1.0));
    E[i] = getError(spec, F[i]);
  }

  if (((E[0] > 0.0) && (E[0] > E[1])) ||
    ((E[0] < 0.0) && (E[0] < E[1])))
    candidates.push({
      freq: F[0],
      error: E[0]
    });

  var j = resolution - 1;
  if (((E[j] > 0.0) && (E[j] > E[j - 1])) ||
    ((E[j] < 0.0) && (E[j] < E[j - 1])))
    candidates.push({
      freq: F[j],
      error: E[j]
    });

  for (var i = 1; i < resolution - 1; i++)
    if ((E[i] >= E[i - 1] && E[i] > E[i + 1] && E[i] > 0.0) ||
      (E[i] <= E[i - 1] && E[i] < E[i + 1] && E[i] < 0.0))
      candidates.push({
        freq: F[i],
        error: E[i]
      });

  for (var i in spec.bands) {
    var b = spec.bands[i];
    candidates.push({
      freq: b.start,
      error: getError(spec, b.start)
    });
    candidates.push({
      freq: b.stop,
      error: getError(spec, b.stop)
    });
  }

  candidates.sort(function (a, b) {
    return a.freq > b.freq ? 1 : -1;
  });

  spec.allextrema = new Array();
  firstUp = new Array();
  firstDown = new Array();
  for (var i in candidates) {
    spec.allextrema.push(candidates[i]);
    firstUp.push(candidates[i]);
    firstDown.push(candidates[i]);
  }
  firstUpError = makeAlternating(1, firstUp, spec);
  firstDownError = makeAlternating(-1, firstDown, spec);

  if (firstUpError > firstDownError)
    spec.extrema = firstUp;
  else
    spec.extrema = firstDown;

  spec.maxerror = calcMaxError(spec.allextrema);

  delete E;
  delete F;

  return spec.extrema.length;
}

function updateFrequencies(spec) {
  spec.frequencies = new Array();
  var e = spec.extrema;
  e.sort(function (a, b) {
    return Math.abs(a.error) < Math.abs(b.error) ? 1 : -1;
  });
  for (var i in e) {
    spec.frequencies.push(e[i].freq);
    //		console.log("        f=" + e[i].freq);
    //log(spec.extrema[i].error);
    if (spec.frequencies.length == spec.r + 1)
      break;
  }
  spec.frequencies.sort(function (a, b) {
    return Math.abs(a) > Math.abs(b) ? 1 : -1;
  });
}

function getExtremaAdaptively(spec) {
  var resolution = spec.r * 16;
  var num_extrema = 0;

  while (num_extrema < spec.r + 1) {
    if (resolution > 200000)
      return false;

    num_extrema = getExtrema(spec, resolution);
    console.log("resolution = ", resolution);
    resolution *= 10;
  }

  return true;
}

function getOnlyDelta(spec) {
  if (spec.numtaps % 2 == 0)
    spec.r = spec.numtaps / 2;
  else
    spec.r = (spec.numtaps + 1) / 2;

  initFrequencies(spec);
  calcDelta(spec);

  return spec.delta;
}

function designFilter(spec) {
  spec.no_convergence = false;
  spec.requirements_met = false;
  spec.delta_too_small = false;

  if (spec.numtaps % 2 == 0)
    spec.r = spec.numtaps / 2;
  else
    spec.r = (spec.numtaps + 1) / 2;

  initFrequencies(spec);

  var iter;
  var lasterror = 1;
  var maxiter = 20;
  for (iter = 0; iter < maxiter; iter++) {
    calcDelta(spec);
    /*if(Math.abs(spec.delta) < 1e-12)
		{
			spec.delta_too_small = true;
			return;
		}*/

    if (!getExtremaAdaptively(spec)) {
      spec.no_convergence = true;
      //			console.log("ERROR: not enough extrema");
      return false;
    }
    var errorchange = lasterror - spec.maxerror;

    console.log("error = " + spec.maxerror + ", errorchange = " + errorchange + "\n");
    if (errorchange >= 0 && errorchange < lasterror * 0.001 && errorchange < 1E-10) {
      //			console.log("wtf quitting");
      break;
    }
    updateFrequencies(spec);
    lasterror = spec.maxerror;
  }

  spec.requirements_met = true;
  for (var i in spec.allextrema) {
    if (!isInLimits(spec, spec.allextrema[i].freq)) {
      spec.requirements_met = false;
      break;
    }
  }

  if (!spec.requirements_met && iter == maxiter) {
    spec.no_convergence = true;
    return;
  }

  //	spec.requirements_met = getRipples(spec);    
  return;
}

function binarySearch(min, max, isgood) {
  while (1) {
    var c = Math.round((max + min) / 2);
    if (c % 2 == 0)
      c++;

    if (isgood(c))
      min = c;
    else
      max = c;

    if (max - min < 3) {
      return min;
    }
  }
}

function getRipples(spec) {
  for (var i in spec.bands) {
    var b = spec.bands[i];
    if (b.gain > 0)
      b.maxgain = b.mingain = getDecibel(b.gain);
    else
      b.maxgain = b.mingain = -1000;
  }

  for (var i in spec.allextrema) {
    var w = spec.allextrema[i].freq;
    var b = getBand(spec, w);

    if (b == null)
      continue;

    var g = getMagnitude(spec, w);
    if (g > b.maxgain)
      b.maxgain = g;
    if (g < b.mingain)
      b.mingain = g;
  }

  var ok = true;
  for (var i in spec.bands) {
    var b = spec.bands[i];
    if (b.gain > 0)
      b.actripple = b.maxgain - b.mingain;
    else
      b.actripple = b.maxgain;

    if (b.actripple > b.ripple)
      ok = false;
  }

  return ok;
}

function optimizeFilter(spec, result) {
  spec.numtaps = 21;

  var deltalimit = 1e-12;

  while (1) {
    var delta = Math.abs(getOnlyDelta(spec));
    if (delta < deltalimit && delta > 0)
      break;
    else
      spec.numtaps = Math.round(spec.numtaps * 1.5);

    if (spec.numtaps > 2000)
      break;
  }

  //alert("delta max = " + spec.numtaps);

  var opt = binarySearch(1, spec.numtaps, function (c) {
    spec.numtaps = c;
    return Math.abs(getOnlyDelta(spec)) > deltalimit;
  }) + 2;

  if (spec.desiredtaps != 0) {
    if (opt > spec.desiredtaps) {
      opt = spec.desiredtaps;
    } else
      alert("The specified tap number can't be achieved due to the limitations of javascript's floating point precision. Try specifying narrower transition bands.");

  }

  if (spec.desiredtaps == 0) {
    opt = binarySearch(1, opt, function (c) {
      //alert("trying " + c);
      spec.numtaps = c;
      designFilter(spec);
      return !spec.requirements_met || spec.no_convergence;
    });
    spec.numtaps = opt + 2;
  } else {
    spec.numtaps = opt;
  }

  designFilter(spec);
  var h = getTaps(spec);
  spec.taps = h;
  spec.hiresTaps = getHiResTaps(spec, 641);
  result.taps = h;

  getRipples(spec);

  spec.finaltaps = spec.numtaps;
  //alert(spec.numtaps);
}
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
      evaluateBehavior: function () {

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
;/* exported complex, evaluatePhase, runMultiFilter, besselFactors */
'use strict';

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

var runMultiFilter = function (input, d, doStep, overwrite) {
  var out = [];
  if (overwrite) {
    out = input;
  }
  var i;
  for (i = 0; i < input.length; i++) {
    out[i] = doStep(input[i], d);
  }
  return out;
};

var factorial = function (n, a) {
  if (!a) {
    a = 1;
  }
  if (n !== Math.floor(n) || a !== Math.floor(a)) {
    return 1;
  }
  if (n === 0 || n === 1) {
    return a;
  } else {
    return factorial(n - 1, a * n);
  }
};

var besselFactors = function (n) {
  var res = [];
  for (var k = 0; k < n + 1; k++) {
    var p = factorial(2 * n - k);
    var q = Math.pow(2, (n - k)) * factorial(k) * factorial(n - k);
    res.unshift(Math.floor(p / q));
  }
  return res;
};

var complex = {

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
