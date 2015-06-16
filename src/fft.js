'use strict';



var Fft = function (radix) {
  var isPowerOfTwo = function (value) {
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

  var windowFunctions = function (params) {
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
      hanning: {
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
      bartlettHanning: {
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
    forward: function (b, window) {
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
        fft.im[i] = 0.0;
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
    inverse: function (re, im) {
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
    magnitude: function (params) {
      var ret = [];
      for (var cnt = 0; cnt < params.re.length; cnt++) {
        ret.push(Math.sqrt(params.re[cnt] * params.re[cnt] + params.im[cnt] * params.im[cnt]));
      }
      return ret;
    },
    magToDb: function (b) {
      var ret = [];
      for (var cnt = 0; cnt < b.length; cnt++) {
        ret.push(20 * Math.log(b[cnt]) * Math.LOG10E);
      }
      return ret;
    },
    phase: function (params) {
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
