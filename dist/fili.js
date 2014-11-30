/*! fili 0.0.3 30-11-2014 */
/*! Author: Florian Markert */
/*! License: MIT */
/* global CalcCoeffs, define */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  var getCoeffs = new CalcCoeffs();
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

  var CalcCascades = function () {
    var cnt = 0;
    var self = {
      getCoefficients: function (params) {
        var filter = [];
        if (params.order > 3) {
          params.order = 3;
        }
        for (cnt = 0; cnt < params.order; cnt++) {
          filter.push(getCoeffs[params.behavior]({
            Fs: params.Fs,
            Fc: params.Fc * table[params.characteristic].f[params.order - 1][cnt],
            Q: table[params.characteristic].q[params.order - 1][cnt]
          }));
        }
        return filter;
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

  var CalcCoeffs = function () {
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
      coeffs.k = 1;
      return coeffs;
    };
    var self = {
      lowpass: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        coeffs.b.push((1 - p.cw) / (2 * p.a0));
        coeffs.b.push(2 * coeffs.b[0]);
        coeffs.b.push(coeffs.b[0]);
        // coeffs.omegaMax = Math.pow((Math.PI * (params.Fc / params.Fs)), 2) * (1 - (1 / (2 * Math.pow(params.Q, 2))));
        // coeffs.ampMax = (Math.abs(coeffs.a0) * params.Q) / (Math.pow((Math.PI * (params.Fc / params.Fs)), 2) * Math.sqrt(1 - (1 / (4 * Math.pow(params.Q, 2)))));
        return coeffs;
      },
      highpass: function (params) {
        var coeffs = initCoeffs();
        var p = preCalc(params, coeffs);
        coeffs.b.push((1 + p.cw) / (2 * p.a0));
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
    module.exports = CalcCoeffs;
  } else {
    window.CalcCoeffs = CalcCoeffs;
    if (typeof define === 'function' && define.amd) {
      define(CalcCoeffs);
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
;var FFT = (function () {
  /* global define */
  'use strict';

  var FFT = function () {
      initialize.apply(this, arguments);
    },
    $this = FFT.prototype;

  var FFT_PARAMS = {
    get: function (n) {
      return FFT_PARAMS[n] || (function () {
        /* jshint bitwise: false */
        var bitrev = (function () {
          var x, i, j, k, n2;
          x = new Int32Array(n);
          n2 = n >> 1;
          i = j = 0;
          for (;;) {
            x[i] = j;
            if (++i >= n) {
              break;
            }
            k = n2;
            while (k <= j) {
              j -= k;
              k >>= 1;
            }
            j += k;
          }
          return x;
        }());
        var i, k = Math.floor(Math.log(n) / Math.LN2);
        var sintable = new Float64Array((1 << k) - 1);
        var costable = new Float64Array((1 << k) - 1);
        var PI2 = Math.PI * 2;

        for (i = sintable.length; i--;) {
          sintable[i] = Math.sin(PI2 * (i / n));
          costable[i] = Math.cos(PI2 * (i / n));
        }
        FFT_PARAMS[n] = {
          bitrev: bitrev,
          sintable: sintable,
          costable: costable
        };
        return FFT_PARAMS[n];
      }());
    }
  };

  var initialize = function (n) {
    /* jshint bitwise: false */
    n = (typeof n === 'number') ? n : 512;
    n = 1 << Math.ceil(Math.log(n) * Math.LOG2E);

    this.length = n;
    this.buffer = new Float64Array(n);
    this.real = new Float64Array(n);
    this.imag = new Float64Array(n);
    this._real = new Float64Array(n);
    this._imag = new Float64Array(n);

    var params = FFT_PARAMS.get(n);
    this._bitrev = params.bitrev;
    this._sintable = params.sintable;
    this._costable = params.costable;
  };

  $this.forward = function (_buffer, wf) {
    var buffer, real, imag, bitrev, sintable, costable, window;
    var i, j, n, k, k2, h, d, c, s, ik, dx, dy;
    var winObj = {};

    buffer = this.buffer;
    real = this.real;
    imag = this.imag;
    bitrev = this._bitrev;
    sintable = this._sintable;
    window = this._window;
    costable = this._costable;
    n = buffer.length;
    winObj.name = wf;
    winObj.N = n;
    winObj.a = 0.5;
    winObj.n = 0;
    var win = this.windowFunctions(winObj);
    if (typeof win === 'number') {
      for (i = 0; i < n; ++i) {
        winObj.n = i;
        buffer[i] = _buffer[i] * this.windowFunctions(winObj);
      }
    } else {
      for (i = 0; i < n; ++i) {
        buffer[i] = _buffer[i] * win[i];
      }
    }

    for (i = n; i--;) {
      real[i] = buffer[bitrev[i]];
      imag[i] = 0.0;
    }

    for (k = 1; k < n; k = k2) {
      h = 0;
      k2 = k + k;
      d = n / k2;
      for (j = 0; j < k; j++) {
        c = costable[h];
        s = sintable[h];
        for (i = j; i < n; i += k2) {
          ik = i + k;
          dx = s * imag[ik] + c * real[ik];
          dy = c * imag[ik] - s * real[ik];
          real[ik] = real[i] - dx;
          real[i] += dx;
          imag[ik] = imag[i] - dy;
          imag[i] += dy;
        }
        h += d;
      }
    }
    return {
      real: real,
      imag: imag
    };
  };

  $this.inverse = function (_real, _imag) {
    var buffer, real, imag, bitrev, sintable, costable;
    var i, j, n, k, k2, h, d, c, s, ik, dx, dy;

    buffer = this.buffer;
    real = this._real;
    imag = this._imag;
    bitrev = this._bitrev;
    sintable = this._sintable;
    costable = this._costable;
    n = buffer.length;

    for (i = n; i--;) {
      j = bitrev[i];
      real[i] = +_real[j];
      imag[i] = -_imag[j];
    }

    for (k = 1; k < n; k = k2) {
      h = 0;
      k2 = k + k;
      d = n / k2;
      for (j = 0; j < k; j++) {
        c = costable[h];
        s = sintable[h];
        for (i = j; i < n; i += k2) {
          ik = i + k;
          dx = s * imag[ik] + c * real[ik];
          dy = c * imag[ik] - s * real[ik];
          real[ik] = real[i] - dx;
          real[i] += dx;
          imag[ik] = imag[i] - dy;
          imag[i] += dy;
        }
        h += d;
      }
    }

    for (i = n; i--;) {
      buffer[i] = real[i] / n;
    }
    return buffer;
  };

  var WindowFunctions = (function () {
    var PI = Math.PI;
    var PI2 = Math.PI * 2;
    var abs = Math.abs;
    var pow = Math.pow;
    var cos = Math.cos;
    var sin = Math.sin;
    var sinc = function (x) {
      return sin(PI * x) / (PI * x);
    };
    var E = Math.E;

    var windowCalculation = {
      rectangular: {
        calc: function () {
          return 1;
        },
        values: [],
        correction: 1
      },
      none: {
        calc: function () {
          return 1;
        },
        values: [],
        correction: 1
      },
      hann: {
        calc: function (n, N) {
          return 0.5 * (1 - cos((PI2 * n) / (N - 1)));
        },
        values: [],
        correction: 2
      },
      hamming: {
        calc: function (n, N) {
          return 0.54 - 0.46 * cos((PI2 * n) / (N - 1));
        },
        values: [],
        correction: 1.8518999946875638
      },
      tukery: {
        calc: function (n, N, a) {
          if (n < (a * (N - 1)) / 2) {
            return 0.5 * (1 + cos(PI * (((2 * n) / (a * (N - 1))) - 1)));
          } else if ((N - 1) * (1 - (a / 2)) < n) {
            return 0.5 * (1 + cos(PI * (((2 * n) / (a * (N - 1))) - (2 / a) + 1)));
          } else {
            return 1;
          }
        },
        values: [],
        correction: 4 / 3
      },
      cosine: {
        calc: function (n, N) {
          return sin((PI * n) / (N - 1));
        },
        values: [],
        correction: 1.570844266360796
      },
      lanczos: {
        calc: function (n, N) {
          return sinc(((2 * n) / (N - 1)) - 1);
        },
        values: [],
        correction: 1.6964337576195783
      },
      triangular: {
        calc: function (n, N) {
          return (2 / (N + 1)) * (((N + 1) / 2) - abs(n - ((N - 1) / 2)));
        },
        values: [],
        correction: 2
      },
      bartlett: {
        calc: function (n, N) {
          return (2 / (N - 1)) * (((N - 1) / 2) - abs(n - ((N - 1) / 2)));
        },
        values: [],
        correction: 2
      },
      gaussian: {
        calc: function (n, N, a) {
          return pow(E, -0.5 * pow((n - (N - 1) / 2) / (a * (N - 1) / 2), 2));
        },
        values: [],
        correction: 5 / 3
      },
      bartlettHann: {
        calc: function (n, N) {
          return 0.62 - 0.48 * abs((n / (N - 1)) - 0.5) - 0.38 * cos((PI2 * n) / (N - 1));
        },
        values: [],
        correction: 2
      },
      blackman: {
        calc: function (n, N, a) {
          var a0 = (1 - a) / 2,
            a1 = 0.5,
            a2 = a / 2;
          return a0 - a1 * cos((PI2 * n) / (N - 1)) + a2 * cos((4 * PI * n) / (N - 1));
        },
        values: [],
        correction: 4 / 3
      }
    };

    var getValue = function (params) {
      if (windowCalculation[params.name].values.length !== params.N) {
        if (params.n === 0) {
          windowCalculation[params.name].values.length = 0;
        }
        windowCalculation[params.name].values[params.n] = windowCalculation[params.name].correction * windowCalculation[params.name].calc(params.n, params.N, params.a);
        return windowCalculation[params.name].values[params.n];
      }
      return windowCalculation[params.name].values;
    };
    return getValue;
  }());

  $this.windowFunctions = WindowFunctions;

  if (typeof define === 'function' && define.amd) {
    define(FFT);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = FFT;
  } else {
    return FFT;
  }
}());
;/* global define, Complex */
/*jslint bitwise: true */
(function (window) {
  'use strict';

  // params: array of biquad coefficient objects and z registers
  // stage structure e.g. {k:1, a:[1.1, -1.2], b:[0.3, -1.2, -0.4], z:[0, 0]}
  var Filter = function (filter) {
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
    }
    var complex = new Complex();
    var runStage = function (s, input) {
      var temp = input * s.k - s.a[0] * s.z[0] - s.a[1] * s.z[1];
      var out = s.b[0] * temp + s.b[1] * s.z[0] + s.b[2] * s.z[1];
      s.z[1] = s.z[0];
      s.z[0] = temp;
      return out;
    };

    var runFilter = function (input) {
      var out = input;
      var cnt = 0;
      for (cnt = 0; cnt < f.length; cnt++) {
        out = runStage(f[cnt], out);
      }
      return out;
    };

    var runMultiFilter = function (input) {
      var cnt = 0;
      var out = [];
      for (cnt = 0; cnt < input.length; cnt++) {
        out.push(runFilter(input[cnt]));
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
      // (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^⁻1 + a2*z^-2)
      var p = complex.add(s.b0, complex.mul(z, complex.add(s.b1, complex.mul(s.b2, z))));
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
        phase: 1
      };
      for (cnt = 0; cnt < cf.length; cnt++) {
        var r = biquadResponse(params, cf[cnt]);
        // a cascade of biquads results in the multiplication of H(z)
        // H_casc(z) = H_0(z) * H_1(z) * ... * H_n(z)
        res.magnitude *= r.magnitude;
        // phase is wrapped -> unwrap before using
        res.phase *= r.phase;
      }
      return res;
    };

    var self = {
      singleStep: function (input) {
        return runFilter(input);
      },
      multiStep: function (input) {
        return runMultiFilter(input);
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
        return res;
      }
    };
    return self;
  };
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = Filter;
  } else {
    window.Filter = Filter;
    if (typeof define === 'function' && define.amd) {
      define(Filter);
    }
  }
})(window);
