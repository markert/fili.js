/**
 * @name    fili
 * @version 0.0.12 | June 17th 2015
 * @author  Florian Markert
 * @license MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fili = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {

  CalcCascades: require('./src/calcCascades'),
  Fft: require('./src/fft'),
  FirCoeffs: require('./src/firCoeffs'),
  FirFilter: require('./src/firFilter'),
  IirCoeffs: require('./src/iirCoeffs'),
  IirFilter: require('./src/iirFilter'),
  TestFilter: require('./src/testFilter')

};

},{"./src/calcCascades":2,"./src/fft":3,"./src/firCoeffs":4,"./src/firFilter":5,"./src/iirCoeffs":6,"./src/iirFilter":7,"./src/testFilter":8}],2:[function(require,module,exports){
'use strict';

var IirCoeffs = require('./iirCoeffs');

var getCoeffs = new IirCoeffs();

var table = {
  // values from https://gist.github.com/endolith/4982787#file-all-values-txt
  bessel: {
    q: [[0.57735026919], [0.805538281842, 0.521934581669], [1.02331395383, 0.611194546878, 0.510317824749], [1.22566942541, 0.710852074442, 0.559609164796, 0.505991069397], [1.41530886916, 0.809790964842, 0.620470155556, 0.537552151325, 0.503912727276], [1.59465693507, 0.905947107025, 0.684008068137, 0.579367238641, 0.525936202016, 0.502755558204], [1.76552743493, 0.998998442993, 0.747625068271, 0.624777082395, 0.556680772868, 0.519027293158, 0.502045428643], [1.9292718407, 1.08906376917, 0.810410302962, 0.671382379377, 0.591144659703, 0.542678365981, 0.514570953471, 0.501578400482], [2.08691792612, 1.17637337045, 0.872034231424, 0.718163551101, 0.627261751983, 0.569890924765, 0.533371782078, 0.511523796759, 0.50125489338], [2.23926560629, 1.26117120993, 0.932397288146, 0.764647810579, 0.664052481472, 0.598921924986, 0.555480327396, 0.526848630061, 0.509345928377, 0.501021580965], [2.38695091667, 1.34368488961, 0.991497755204, 0.81060830488, 0.701011199665, 0.628878390935, 0.57943181849, 0.545207253735, 0.52208637596, 0.507736060535, 0.500847111042], [2.53048919562, 1.42411783481, 1.04937620183, 0.85593899901, 0.737862159044, 0.659265671705, 0.604435823473, 0.565352679646, 0.537608804383, 0.51849505465, 0.506508536474, 0.500715908905]],
    f3dB: [[1.27201964951], [1.60335751622, 1.43017155999], [1.9047076123, 1.68916826762, 1.60391912877], [2.18872623053, 1.95319575902, 1.8320926012, 1.77846591177], [2.45062684305, 2.20375262593, 2.06220731793, 1.98055310881, 1.94270419166], [2.69298925084, 2.43912611431, 2.28431825401, 2.18496722634, 2.12472538477, 2.09613322542], [2.91905714471, 2.66069088948, 2.49663434571, 2.38497976939, 2.30961462222, 2.26265746534, 2.24005716132], [3.13149167404, 2.87016099416, 2.69935018044, 2.57862945683, 2.49225505119, 2.43227707449, 2.39427710712, 2.37582307687], [3.33237300564, 3.06908580184, 2.89318259511, 2.76551588399, 2.67073340527, 2.60094950474, 2.55161764546, 2.52001358804, 2.50457164552], [3.52333123464, 3.25877569704, 3.07894353744, 2.94580435024, 2.84438325189, 2.76691082498, 2.70881411245, 2.66724655259, 2.64040228249, 2.62723439989], [3.70566068548, 3.44032173223, 3.2574059854, 3.11986367838, 3.01307175388, 2.92939234605, 2.86428726094, 2.81483068055, 2.77915465405, 2.75596888377, 2.74456638588], [3.88040469682, 3.61463243697, 3.4292654707, 3.28812274966, 3.17689762788, 3.08812364257, 3.01720732972, 2.96140104561, 2.91862858495, 2.88729479473, 2.8674198668, 2.8570800015]],
    f1dB: [[2.16477559371], [2.70320928596, 2.41122332505], [3.25676581436, 2.88822569572, 2.74246238837], [3.76153580353, 3.35675411406, 3.14862673032, 3.05646412475], [4.22174260104, 3.79644757806, 3.55260471864, 3.41193742197, 3.34673435508], [4.64584812552, 4.20789257981, 3.94082363122, 3.76942681446, 3.66549975744, 3.61617359345], [5.04060395196, 4.5944592201, 4.3111677248, 4.11836351827, 3.98822359814, 3.90713836715, 3.86811234525], [5.41107948467, 4.95951159709, 4.66435804468, 4.45575796102, 4.30650679478, 4.20286750045, 4.13720522991, 4.10531748119], [5.76110791853, 5.30592898465, 5.00182215701, 4.7811081045, 4.61724509926, 4.49660100894, 4.41131378918, 4.35667671372, 4.32997951075], [6.09364309488, 5.63609116014, 5.32506930789, 5.09480346139, 4.91939504255, 4.78540258409, 4.68493280536, 4.61302286993, 4.56661931366, 4.54382759952], [6.41100731543, 5.95195558182, 5.63550073656, 5.39754464742, 5.21278891332, 5.06801430334, 4.95539684456, 4.8697869429, 4.80814951843, 4.76793469612, 4.74828032403], [6.71506056052, 6.25514029778, 5.9343616072, 5.69011422355, 5.49763642361, 5.34401973764, 5.22125973611, 5.12485045619, 5.05037962112, 4.99699982231, 4.96155789635, 4.94441828777]]
  }
};

var calcCoeffs = function calcCoeffs(params, behavior) {
  var filter = [];
  var cnt = 0;
  if (behavior !== 'fromPZ') {
    if (params.order > 12) {
      params.order = 12;
    }
    for (cnt = 0; cnt < params.order; cnt++) {
      var q, f, fd;
      if (params.characteristic === 'butterworth') {
        q = 0.5 / Math.sin(Math.PI / (params.order * 2) * (cnt + 0.5));
        f = 1;
      } else {
        q = table[params.characteristic].q[params.order - 1][cnt];
        if (params.oneDb) {
          f = table[params.characteristic].f1dB[params.order - 1][cnt];
        } else {
          f = table[params.characteristic].f3dB[params.order - 1][cnt];
        }
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
  } else {
    for (cnt = 0; cnt < params.length; cnt++) {
      filter.push(getCoeffs[behavior](params[cnt]));
    }
  }

  return filter;
};

var initCalcCoeffs = function initCalcCoeffs(behavior) {
  return function (params) {
    return calcCoeffs(params, behavior);
  };
};

var self = {};
var CalcCascades = function CalcCascades() {
  for (var k in getCoeffs) {
    self[k] = initCalcCoeffs(k);
  }
  return self;
};

module.exports = CalcCascades;

},{"./iirCoeffs":6}],3:[function(require,module,exports){
'use strict';

var Fft = function Fft(radix) {
  var isPowerOfTwo = function isPowerOfTwo(value) {
    if (!(value & value - 1)) {
      return true;
    }
    return false;
  };

  if (!isPowerOfTwo(radix)) {
    return false;
  }

  var fft = {};
  fft.length = radix;
  fft.buffer = new Float64Array(radix);
  fft.re = new Float64Array(radix);
  fft.im = new Float64Array(radix);
  fft.reI = new Float64Array(radix);
  fft.imI = new Float64Array(radix);

  fft.twiddle = new Int32Array(radix);
  fft.sinTable = new Float64Array(radix - 1);
  fft.cosTable = new Float64Array(radix - 1);
  var TPI = 2 * Math.PI;
  var bits = Math.floor(Math.log(radix) / Math.LN2);

  for (i = fft.sinTable.length; i--;) {
    fft.sinTable[i] = Math.sin(TPI * (i / radix));
    fft.cosTable[i] = Math.cos(TPI * (i / radix));
  }

  var nh = radix >> 1;
  var i = 0;
  var j = 0;
  for (;;) {
    fft.twiddle[i] = j;
    if (++i >= radix) {
      break;
    }
    bits = nh;
    while (bits <= j) {
      j -= bits;
      bits >>= 1;
    }
    j += bits;
  }

  var windowFunctions = function windowFunctions(params) {
    var PI = Math.PI;
    var PI2 = Math.PI * 2;
    var abs = Math.abs;
    var pow = Math.pow;
    var cos = Math.cos;
    var sin = Math.sin;
    var sinc = function sinc(x) {
      return sin(PI * x) / (PI * x);
    };
    var E = Math.E;

    var windowCalculation = {
      rectangular: {
        calc: function calc() {
          return 1;
        },
        values: [],
        correction: 1
      },
      none: {
        calc: function calc() {
          return 1;
        },
        values: [],
        correction: 1
      },
      hanning: {
        calc: function calc(n, N) {
          return 0.5 * (1 - cos(PI2 * n / (N - 1)));
        },
        values: [],
        correction: 2
      },
      hamming: {
        calc: function calc(n, N) {
          return 0.54 - 0.46 * cos(PI2 * n / (N - 1));
        },
        values: [],
        correction: 1.8518999946875638
      },
      tukery: {
        calc: function calc(n, N, a) {
          if (n < a * (N - 1) / 2) {
            return 0.5 * (1 + cos(PI * (2 * n / (a * (N - 1)) - 1)));
          } else if ((N - 1) * (1 - a / 2) < n) {
            return 0.5 * (1 + cos(PI * (2 * n / (a * (N - 1)) - 2 / a + 1)));
          } else {
            return 1;
          }
        },
        values: [],
        correction: 4 / 3
      },
      cosine: {
        calc: function calc(n, N) {
          return sin(PI * n / (N - 1));
        },
        values: [],
        correction: 1.570844266360796
      },
      lanczos: {
        calc: function calc(n, N) {
          return sinc(2 * n / (N - 1) - 1);
        },
        values: [],
        correction: 1.6964337576195783
      },
      triangular: {
        calc: function calc(n, N) {
          return 2 / (N + 1) * ((N + 1) / 2 - abs(n - (N - 1) / 2));
        },
        values: [],
        correction: 2
      },
      bartlett: {
        calc: function calc(n, N) {
          return 2 / (N - 1) * ((N - 1) / 2 - abs(n - (N - 1) / 2));
        },
        values: [],
        correction: 2
      },
      gaussian: {
        calc: function calc(n, N, a) {
          return pow(E, -0.5 * pow((n - (N - 1) / 2) / (a * (N - 1) / 2), 2));
        },
        values: [],
        correction: 5 / 3
      },
      bartlettHanning: {
        calc: function calc(n, N) {
          return 0.62 - 0.48 * abs(n / (N - 1) - 0.5) - 0.38 * cos(PI2 * n / (N - 1));
        },
        values: [],
        correction: 2
      },
      blackman: {
        calc: function calc(n, N, a) {
          var a0 = (1 - a) / 2,
              a1 = 0.5,
              a2 = a / 2;
          return a0 - a1 * cos(PI2 * n / (N - 1)) + a2 * cos(4 * PI * n / (N - 1));
        },
        values: [],
        correction: 4 / 3
      }
    };

    if (windowCalculation[params.name].values.length !== params.N) {
      if (params.n === 0) {
        windowCalculation[params.name].values.length = 0;
      }
      windowCalculation[params.name].values[params.n] = windowCalculation[params.name].correction * windowCalculation[params.name].calc(params.n, params.N, params.a);
      return windowCalculation[params.name].values[params.n];
    }
    return windowCalculation[params.name].values;
  };

  var self = {
    forward: function forward(b, window) {
      var i, j, n, k, k2, h, d, c, s, ik, dx, dy;
      n = fft.buffer.length;
      var winFunction = {
        name: window,
        N: n,
        a: 0.5,
        n: 0
      };
      var w = windowFunctions(winFunction);
      if (typeof w === 'number') {
        for (i = 0; i < n; ++i) {
          winFunction.n = i;
          fft.buffer[i] = b[i] * windowFunctions(winFunction);
        }
      } else {
        for (i = 0; i < n; ++i) {
          fft.buffer[i] = b[i] * w[i];
        }
      }

      for (i = n; i--;) {
        fft.re[i] = fft.buffer[fft.twiddle[i]];
        fft.im[i] = 0;
      }

      for (k = 1; k < n; k = k2) {
        h = 0;
        k2 = k + k;
        d = n / k2;
        for (j = 0; j < k; j++) {
          c = fft.cosTable[h];
          s = fft.sinTable[h];
          for (i = j; i < n; i += k2) {
            ik = i + k;
            dx = s * fft.im[ik] + c * fft.re[ik];
            dy = c * fft.im[ik] - s * fft.re[ik];
            fft.re[ik] = fft.re[i] - dx;
            fft.re[i] += dx;
            fft.im[ik] = fft.im[i] - dy;
            fft.im[i] += dy;
          }
          h += d;
        }
      }
      return {
        re: fft.re,
        im: fft.im
      };
    },
    inverse: function inverse(re, im) {
      var i, j, n, k, k2, h, d, c, s, ik, dx, dy;
      for (i = n; i--;) {
        j = fft.twiddle[i];
        fft.reI[i] = re[j];
        fft.imI[i] = -im[j];
      }

      for (k = 1; k < n; k = k2) {
        h = 0;
        k2 = k + k;
        d = n / k2;
        for (j = 0; j < k; j++) {
          c = fft.cosTable[h];
          s = fft.sinTable[h];
          for (i = j; i < n; i += k2) {
            ik = i + k;
            dx = s * fft.imI[ik] + c * fft.reI[ik];
            dy = c * fft.imI[ik] - s * fft.reI[ik];
            fft.reI[ik] = fft.reI[i] - dx;
            fft.reI[i] += dx;
            fft.imI[ik] = fft.imI[i] - dy;
            fft.imI[i] += dy;
          }
          h += d;
        }
      }

      for (i = n; i--;) {
        fft.buffer[i] = fft.reI[i] / n;
      }
      return fft.buffer;
    },
    magnitude: function magnitude(params) {
      var ret = [];
      for (var cnt = 0; cnt < params.re.length; cnt++) {
        ret.push(Math.sqrt(params.re[cnt] * params.re[cnt] + params.im[cnt] * params.im[cnt]));
      }
      return ret;
    },
    magToDb: function magToDb(b) {
      var ret = [];
      for (var cnt = 0; cnt < b.length; cnt++) {
        ret.push(20 * Math.log(b[cnt]) * Math.LOG10E);
      }
      return ret;
    },
    phase: function phase(params) {
      var ret = [];
      for (var cnt = 0; cnt < params.re.length; cnt++) {
        ret.push(Math.atan2(params.im[cnt], params.re[cnt]));
      }
      return ret;
    }
  };
  return self;
};

module.exports = Fft;

},{}],4:[function(require,module,exports){
'use strict';

var FirCoeffs = function FirCoeffs() {

  // Kaiser windowd filters
  // desired attenuation can be defined
  // better than windowd sinc filters
  var calcKImpulseResponse = function calcKImpulseResponse(params) {
    var Fs = params.Fs;
    var Fa = params.Fa;
    var Fb = params.Fb;
    var o = params.order || 51;
    var alpha = params.Att || 100;
    var ino = function ino(val) {
      var d = 0;
      var ds = 1;
      var s = 1;
      while (ds > s * 0.000001) {
        d += 2;
        ds *= val * val / (d * d);
        s += ds;
      }
      return s;
    };

    if (o / 2 - Math.floor(o / 2) === 0) {
      o++;
    }
    var Np = (o - 1) / 2;
    var A = [];
    var beta = 0;
    var cnt = 0;
    var inoBeta;
    var ret = [];

    A[0] = 2 * (Fb - Fa) / Fs;
    for (cnt = 1; cnt <= Np; cnt++) {
      A[cnt] = (Math.sin(2 * cnt * Math.PI * Fb / Fs) - Math.sin(2 * cnt * Math.PI * Fa / Fs)) / (cnt * Math.PI);
    }
    // empirical coefficients
    if (alpha < 21) {
      beta = 0;
    } else if (alpha > 50) {
      beta = 0.1102 * (alpha - 8.7);
    } else {
      beta = 0.5842 * Math.pow(alpha - 21, 0.4) + 0.07886 * (alpha - 21);
    }

    inoBeta = ino(beta);
    for (cnt = 0; cnt <= Np; cnt++) {
      ret[Np + cnt] = A[cnt] * ino(beta * Math.sqrt(1 - cnt * cnt / (Np * Np))) / inoBeta;
    }
    for (cnt = 0; cnt < Np; cnt++) {
      ret[cnt] = ret[o - 1 - cnt];
    }
    return ret;
  };

  // note: coefficients are equal to impulse response
  // windowd sinc filter
  var calcImpulseResponse = function calcImpulseResponse(params) {
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
        ret[cnt] *= 0.54 - 0.46 * Math.cos(2 * Math.PI * cnt / o);
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
  var invert = function invert(h) {
    var cnt;
    for (cnt = 0; cnt < h.length; cnt++) {
      h[cnt] = -h[cnt];
    }
    h[(h.length - 1) / 2]++;
    return h;
  };
  var bs = function bs(params) {
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
    lowpass: function lowpass(params) {
      return calcImpulseResponse(params);
    },
    highpass: function highpass(params) {
      return invert(calcImpulseResponse(params));
    },
    bandstop: function bandstop(params) {
      return bs(params);
    },
    bandpass: function bandpass(params) {
      return invert(bs(params));
    },
    kbFilter: function kbFilter(params) {
      return calcKImpulseResponse(params);
    }
  };
  return self;
};

module.exports = FirCoeffs;

},{}],5:[function(require,module,exports){
'use strict';

var _require = require('./utils');

var runMultiFilter = _require.runMultiFilter;
var complex = _require.complex;
var evaluatePhase = _require.evaluatePhase;

/**
 * Fir filter
 */
var FirFilter = function FirFilter(filter) {
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

  var initZero = function initZero(cnt) {
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

  var doStep = function doStep(input, d) {
    d.buf[d.pointer] = input;
    var out = 0;
    for (cnt = 0; cnt < d.buf.length; cnt++) {
      out += f[cnt] * d.buf[(d.pointer + cnt) % d.buf.length];
    }
    d.pointer = (d.pointer + 1) % d.buf.length;
    return out;
  };

  var calcInputResponse = function calcInputResponse(input) {
    var tempF = initZero(f.length - 1);
    return runMultiFilter(input, tempF, doStep);
  };

  var calcResponse = function calcResponse(params) {
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
    responsePoint: function responsePoint(params) {
      return calcResponse(params);
    },
    response: function response(resolution) {
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
    simulate: function simulate(input) {
      return calcInputResponse(input);
    },
    singleStep: function singleStep(input) {
      return doStep(input, z);
    },
    multiStep: function multiStep(input, overwrite) {
      return runMultiFilter(input, z, doStep, overwrite);
    },
    reinit: function reinit() {
      z = initZero(f.length - 1);
    }
  };
  return self;
};

module.exports = FirFilter;

},{"./utils":9}],6:[function(require,module,exports){
'use strict';

var IirCoeffs = function IirCoeffs() {

  var preCalc = function preCalc(params, coeffs) {
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
    coeffs.a.push(-2 * pre.cw / pre.a0);
    coeffs.a.push((1 - pre.alpha) / pre.a0);
    return pre;
  };

  var preCalcGain = function preCalcGain(params) {
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

  var initCoeffs = function initCoeffs() {
    var coeffs = {};
    coeffs.z = [0, 0];
    coeffs.a = [];
    coeffs.b = [];
    return coeffs;
  };

  var self = {

    fromPZ: function fromPZ(params) {
      var coeffs = initCoeffs();
      coeffs.a0 = 1;
      coeffs.b.push(1);
      coeffs.b.push(-params.z0.re - params.z1.re);
      coeffs.b.push(params.z0.re * params.z1.re - params.z0.im * params.z1.im);
      coeffs.a.push(-params.p0.re - params.p1.re);
      coeffs.a.push(params.p0.re * params.p1.re - params.p0.im * params.p1.im);
      if (params.type === 'lowpass') {
        coeffs.k = (1 + coeffs.a[0] + coeffs.a[1]) / (1 + coeffs.b[1] + coeffs.b[2]);
      } else {
        coeffs.k = (1 - coeffs.a[0] + coeffs.a[1]) / (1 - coeffs.b[1] + coeffs.b[2]);
      }
      return coeffs;
    },

    // Bessel-Thomson: H(s) = 3/(s^2+3*s+3)
    lowpassBT: function lowpassBT(params) {
      var coeffs = initCoeffs();
      params.Q = 1;
      coeffs.wp = Math.tan(2 * Math.PI * params.Fc / (2 * params.Fs));
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

    highpassBT: function highpassBT(params) {
      var coeffs = initCoeffs();
      params.Q = 1;
      coeffs.wp = Math.tan(2 * Math.PI * params.Fc / (2 * params.Fs));
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
    lowpass: function lowpass(params) {
      var coeffs = initCoeffs();
      if (params.BW) {
        delete params.BW;
      }
      var p = preCalc(params, coeffs);
      if (params.preGain) {
        coeffs.k = (1 - p.cw) * 0.5;
        coeffs.b.push(1 / p.a0);
      } else {
        coeffs.k = 1;
        coeffs.b.push((1 - p.cw) / (2 * p.a0));
      }
      coeffs.b.push(2 * coeffs.b[0]);
      coeffs.b.push(coeffs.b[0]);
      return coeffs;
    },

    // H(s) = s^2 / (s^2 + s/Q + 1)
    highpass: function highpass(params) {
      var coeffs = initCoeffs();
      if (params.BW) {
        delete params.BW;
      }
      var p = preCalc(params, coeffs);
      if (params.preGain) {
        coeffs.k = (1 + p.cw) * 0.5;
        coeffs.b.push(1 / p.a0);
      } else {
        coeffs.k = 1;
        coeffs.b.push((1 + p.cw) / (2 * p.a0));
      }
      coeffs.b.push(-2 * coeffs.b[0]);
      coeffs.b.push(coeffs.b[0]);
      return coeffs;
    },

    // H(s) = (s^2 - s/Q + 1) / (s^2 + s/Q + 1)
    allpass: function allpass(params) {
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
    bandpassQ: function bandpassQ(params) {
      var coeffs = initCoeffs();
      var p = preCalc(params, coeffs);
      coeffs.k = 1;
      coeffs.b.push(p.alpha * params.Q / p.a0);
      coeffs.b.push(0);
      coeffs.b.push(-coeffs.b[0]);
      return coeffs;
    },

    // H(s) = (s/Q) / (s^2 + s/Q + 1)
    bandpass: function bandpass(params) {
      var coeffs = initCoeffs();
      var p = preCalc(params, coeffs);
      coeffs.k = 1;
      coeffs.b.push(p.alpha / p.a0);
      coeffs.b.push(0);
      coeffs.b.push(-coeffs.b[0]);
      return coeffs;
    },

    // H(s) = (s^2 + 1) / (s^2 + s/Q + 1)
    bandstop: function bandstop(params) {
      var coeffs = initCoeffs();
      var p = preCalc(params, coeffs);
      coeffs.k = 1;
      coeffs.b.push(1 / p.a0);
      coeffs.b.push(-2 * p.cw / p.a0);
      coeffs.b.push(coeffs.b[0]);
      return coeffs;
    },

    // H(s) = (s^2 + s*(A/Q) + 1) / (s^2 + s/(A*Q) + 1)
    peak: function peak(params) {
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
    lowshelf: function lowshelf(params) {
      var coeffs = initCoeffs();
      if (params.BW) {
        delete params.BW;
      }
      var p = preCalcGain(params);
      coeffs.k = 1;
      var sa = 2 * Math.sqrt(p.A) * p.alpha;
      coeffs.a0 = p.A + 1 + (p.A - 1) * p.cw + sa;
      coeffs.a.push(-2 * (p.A - 1 + (p.A + 1) * p.cw) / coeffs.a0);
      coeffs.a.push((p.A + 1 + (p.A - 1) * p.cw - sa) / coeffs.a0);
      coeffs.b.push(p.A * (p.A + 1 - (p.A - 1) * p.cw + sa) / coeffs.a0);
      coeffs.b.push(2 * p.A * (p.A - 1 - (p.A + 1) * p.cw) / coeffs.a0);
      coeffs.b.push(p.A * (p.A + 1 - (p.A - 1) * p.cw - sa) / coeffs.a0);
      return coeffs;
    },

    // H(s) = A * (A*s^2 + (sqrt(A)/Q)*s + 1)/(s^2 + (sqrt(A)/Q)*s + A)
    highshelf: function highshelf(params) {
      var coeffs = initCoeffs();
      if (params.BW) {
        delete params.BW;
      }
      var p = preCalcGain(params);
      coeffs.k = 1;
      var sa = 2 * Math.sqrt(p.A) * p.alpha;
      coeffs.a0 = p.A + 1 - (p.A - 1) * p.cw + sa;
      coeffs.a.push(2 * (p.A - 1 - (p.A + 1) * p.cw) / coeffs.a0);
      coeffs.a.push((p.A + 1 - (p.A - 1) * p.cw - sa) / coeffs.a0);
      coeffs.b.push(p.A * (p.A + 1 + (p.A - 1) * p.cw + sa) / coeffs.a0);
      coeffs.b.push(-2 * p.A * (p.A - 1 + (p.A + 1) * p.cw) / coeffs.a0);
      coeffs.b.push(p.A * (p.A + 1 + (p.A - 1) * p.cw - sa) / coeffs.a0);
      return coeffs;
    }
  };

  return self;
};

module.exports = IirCoeffs;

},{}],7:[function(require,module,exports){
'use strict';

var _require = require('./utils');

var complex = _require.complex;
var runMultiFilter = _require.runMultiFilter;
var evaluatePhase = _require.evaluatePhase;

// params: array of biquad coefficient objects and z registers
// stage structure e.g. {k:1, a:[1.1, -1.2], b:[0.3, -1.2, -0.4], z:[0, 0]}
var IirFilter = function IirFilter(filter) {
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

  var runStage = function runStage(s, input) {
    var temp = input * s.k - s.a[0] * s.z[0] - s.a[1] * s.z[1];
    var out = s.b[0] * temp + s.b[1] * s.z[0] + s.b[2] * s.z[1];
    s.z[1] = s.z[0];
    s.z[0] = temp;
    return out;
  };

  var doStep = function doStep(input, coeffs) {
    var out = input;
    var cnt = 0;
    for (cnt = 0; cnt < coeffs.length; cnt++) {
      out = runStage(coeffs[cnt], out);
    }
    return out;
  };

  var biquadResponse = function biquadResponse(params, s) {
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

  var calcResponse = function calcResponse(params) {
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

  var reinit = function reinit() {
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

  var calcInputResponse = function calcInputResponse(input) {
    var tempF = reinit();
    return runMultiFilter(input, tempF, doStep);
  };

  var predefinedResponse = function predefinedResponse(def, length) {
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

  var getComplRes = function getComplRes(n1, n2) {
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

  var getPZ = function getPZ() {
    var res = [];
    for (var cnt = 0; cnt < cc.length; cnt++) {
      res[cnt] = {};
      res[cnt].z = getComplRes(cc[cnt].b1, cc[cnt].b2);
      res[cnt].p = getComplRes(cc[cnt].a1, cc[cnt].a2);
    }
    return res;
  };

  var self = {
    singleStep: function singleStep(input) {
      return doStep(input, f);
    },
    multiStep: function multiStep(input, overwrite) {
      return runMultiFilter(input, f, doStep, overwrite);
    },
    simulate: function simulate(input) {
      return calcInputResponse(input);
    },
    stepResponse: function stepResponse(length) {
      return predefinedResponse(function () {
        return 1;
      }, length);
    },
    impulseResponse: function impulseResponse(length) {
      return predefinedResponse(function (val) {
        if (val === 0) {
          return 1;
        } else {
          return 0;
        }
      }, length);
    },
    responsePoint: function responsePoint(params) {
      return calcResponse(params);
    },
    response: function response(resolution) {
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
    polesZeros: function polesZeros() {
      return getPZ();
    },
    reinit: function reinit() {
      for (cnt = 0; cnt < f.length; cnt++) {
        f[cnt].z = [0, 0];
      }
    }
  };
  return self;
};

module.exports = IirFilter;

},{"./utils":9}],8:[function(require,module,exports){
'use strict';

/**
 * Test filter
 */
var TestFilter = function TestFilter(filter) {
  var f = filter;

  var simData = [];
  var cnt;

  var randomValues = function randomValues(params) {
    for (cnt = 0; cnt < params.steps; cnt++) {
      simData.push(f.singleStep((Math.random() - 0.5) * params.pp + params.offset));
    }
  };

  var stepValues = function stepValues(params) {
    var max = params.offset + params.pp;
    var min = params.offset - params.pp;
    for (cnt = 0; cnt < params.steps; cnt++) {
      if (cnt % 200 < 100) {
        simData.push(f.singleStep(max));
      } else {
        simData.push(f.singleStep(min));
      }
    }
  };

  var impulseValues = function impulseValues(params) {
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

  var rampValues = function rampValues(params) {
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
    randomStability: function randomStability(params) {
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
    directedRandomStability: function directedRandomStability(params) {
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
    evaluateBehavior: function evaluateBehavior() {}
  };
  return self;
};

module.exports = TestFilter;

},{}],9:[function(require,module,exports){
'use strict';

/**
 * Evaluate phase
 */
exports.evaluatePhase = function (res) {
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
    if (res[cnt].groupDelay < 0) {
      res[cnt].groupDelay = -res[cnt].groupDelay;
    }
  }
  if (res[0].magnitude !== 0) {
    res[0].phaseDelay = res[1].phaseDelay;
    res[0].groupDelay = res[1].groupDelay;
  } else {
    res[0].phaseDelay = res[2].phaseDelay;
    res[0].groupDelay = res[2].groupDelay;
    res[1].phaseDelay = res[2].phaseDelay;
    res[1].groupDelay = res[2].groupDelay;
  }
};

/**
 * Run multi filter
 */
exports.runMultiFilter = function (input, d, doStep, overwrite) {
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

var factorial = function factorial(_x, _x2) {
  var _again = true;

  _function: while (_again) {
    var n = _x,
        a = _x2;
    _again = false;

    if (!a) {
      a = 1;
    }
    if (n !== Math.floor(n) || a !== Math.floor(a)) {
      return 1;
    }
    if (n === 0 || n === 1) {
      return a;
    } else {
      _x = n - 1;
      _x2 = a * n;
      _again = true;
      continue _function;
    }
  }
};

/**
 * Bessel factors
 */
exports.besselFactors = function (n) {
  var res = [];
  for (var k = 0; k < n + 1; k++) {
    var p = factorial(2 * n - k);
    var q = Math.pow(2, n - k) * factorial(k) * factorial(n - k);
    res.unshift(Math.floor(p / q));
  }
  return res;
};

/**
 * Complex
 */
exports.complex = {

  div: function div(p, q) {
    var a = p.re,
        b = p.im,
        c = q.re,
        d = q.im;
    var n = c * c + d * d;
    var x = {
      re: (a * c + b * d) / n,
      im: (b * c - a * d) / n
    };
    return x;
  },
  mul: function mul(p, q) {
    var a = p.re,
        b = p.im,
        c = q.re,
        d = q.im;
    var x = {
      re: a * c - b * d,
      im: (a + b) * (c + d) - a * c - b * d
    };
    return x;
  },
  add: function add(p, q) {
    var x = {
      re: p.re + q.re,
      im: p.im + q.im
    };
    return x;
  },
  sub: function sub(p, q) {
    var x = {
      re: p.re - q.re,
      im: p.im - q.im
    };
    return x;
  },
  phase: function phase(n) {
    return Math.atan2(n.im, n.re);
  },
  magnitude: function magnitude(n) {
    return Math.sqrt(n.re * n.re + n.im * n.im);
  }
};

},{}]},{},[1])(1)
});