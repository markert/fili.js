'use strict'

/**
 * Evaluate phase
 */
exports.evaluatePhase = function (res) {
  var xcnt = 0
  var cnt = 0
  var pi = Math.PI
  var tpi = 2 * pi
  var phase = []
  for (cnt = 0; cnt < res.length; cnt++) {
    phase.push(res[cnt].phase)
  }
  res[0].unwrappedPhase = res[0].phase
  res[0].groupDelay = 0
  // TODO: more sophisticated phase unwrapping needed
  for (cnt = 1; cnt < phase.length; cnt++) {
    var diff = phase[cnt] - phase[cnt - 1]
    if (diff > pi) {
      for (xcnt = cnt; xcnt < phase.length; xcnt++) {
        phase[xcnt] -= tpi
      }
    } else if (diff < -pi) {
      for (xcnt = cnt; xcnt < phase.length; xcnt++) {
        phase[xcnt] += tpi
      }
    }
    if (phase[cnt] < 0) {
      res[cnt].unwrappedPhase = -phase[cnt]
    } else {
      res[cnt].unwrappedPhase = phase[cnt]
    }

    res[cnt].phaseDelay = res[cnt].unwrappedPhase / (cnt / res.length)
    res[cnt].groupDelay = (res[cnt].unwrappedPhase - res[cnt - 1].unwrappedPhase) / (pi / res.length)
    if (res[cnt].groupDelay < 0) {
      res[cnt].groupDelay = -res[cnt].groupDelay
    }
  }
  if (res[0].magnitude !== 0) {
    res[0].phaseDelay = res[1].phaseDelay
    res[0].groupDelay = res[1].groupDelay
  } else {
    res[0].phaseDelay = res[2].phaseDelay
    res[0].groupDelay = res[2].groupDelay
    res[1].phaseDelay = res[2].phaseDelay
    res[1].groupDelay = res[2].groupDelay
  }
}

/**
 * Run multi filter
 */
exports.runMultiFilter = function (input, d, doStep, overwrite) {
  var out = []
  if (overwrite) {
    out = input
  }
  var i
  for (i = 0; i < input.length; i++) {
    out[i] = doStep(input[i], d)
  }
  return out
}

var factorial = function (n, a) {
  if (!a) {
    a = 1
  }
  if (n !== Math.floor(n) || a !== Math.floor(a)) {
    return 1
  }
  if (n === 0 || n === 1) {
    return a
  } else {
    return factorial(n - 1, a * n)
  }
}

/**
 * Bessel factors
 */
exports.besselFactors = function (n) {
  var res = []
  for (var k = 0; k < n + 1; k++) {
    var p = factorial(2 * n - k)
    var q = Math.pow(2, (n - k)) * factorial(k) * factorial(n - k)
    res.unshift(Math.floor(p / q))
  }
  return res
}

var fractionToFp = function (fraction, fractionBits) {
  var fpFraction = 0
  for (var cnt = 0; cnt < fractionBits; cnt++) {
    var bitVal = 1 / Math.pow(2, cnt + 1)
    if (fraction > bitVal) {
      fraction -= bitVal
      fpFraction += bitVal
    }
  }
  return fpFraction
}

var numberToFp = function (number, numberBits) {
  return number & Math.pow(2, numberBits)
}

var valueToFp = function (value, numberBits, fractionBits) {
  var number = Math.abs(value)
  var fraction = value - number
  var fpNumber = {
    number: numberToFp(number, numberBits).toString(),
    fraction: fractionToFp(fraction, fractionBits).toString(),
    numberBits: numberBits,
    fractionBits: fractionBits
  }
  return fpNumber
}

exports.fixedPoint = {
  convert: function (value, numberBits, fractionBits) {
    return valueToFp(value, numberBits, fractionBits)
  },
  add: function (fpVal1, fpVal2) {
  },
  sub: function (fpVal1, fpVal2) {
  },
  mul: function (fpVal1, fpVal2) {
  },
  div: function (fpVal1, fpVal2) {
  }
}

/**
 * Complex
 */
exports.complex = {

  div: function (p, q) {
    var a = p.re
    var b = p.im
    var c = q.re
    var d = q.im
    var n = (c * c + d * d)
    var x = {
      re: (a * c + b * d) / n,
      im: (b * c - a * d) / n
    }
    return x
  },
  mul: function (p, q) {
    var a = p.re
    var b = p.im
    var c = q.re
    var d = q.im
    var x = {
      re: (a * c - b * d),
      im: (a + b) * (c + d) - a * c - b * d
    }
    return x
  },
  add: function (p, q) {
    var x = {
      re: p.re + q.re,
      im: p.im + q.im
    }
    return x
  },
  sub: function (p, q) {
    var x = {
      re: p.re - q.re,
      im: p.im - q.im
    }
    return x
  },
  phase: function (n) {
    return Math.atan2(n.im, n.re)
  },
  magnitude: function (n) {
    return Math.sqrt(n.re * n.re + n.im * n.im)
  }
}

var math = require("mathjs");

/*
    A function that takes a and b coefficients and generates the intial state (zi) of a second order filter that corresponds to the steady state of the step response

    Parameters: a, b: Array<number>, the IIR filter coefficients
    Returns: zi: Array<number>, the initial state for the filter
*/
exports.computeInitialState = function(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new Error("Coefficients must be arrays");
  }
  if (a[0].length != undefined || b[0].length != undefined) {
    throw new Error("Coefficients must be 1D");
  }

  // Fili removes the 1 at the front of the a coefficients, unlike scipy
  // We'll just add this back in so our code conforms more to the scipy implementation
  if (a[0] != 1) {
    a.unshift(1);
  }
  
  if (a.length < 1) {
    throw new Error("There must be at least one non-zero `a` coefficient");
  }

  // Normalize coefficients
  if (a[0] != 1) {
    b = b.map(function(val) {
      return val / a[0];
    });
    a = a.map(function(val) {
      return val / a[0];
    });
  }

  var n = Math.max(a.length, b.length);

  // Pad a or b with zeros so they are the same length
  if (a.length < n) {
    a = a.concat(new Array(n - a.length).fill(0));
  } else if (b.length < n) {
    b = b.concat(new Array(n - b.length).fill(0));
  }
  
      // Companion matrix function
  var companion = function(array) {
  return new Array(array.length - 1)
      .fill(new Array(array.length - 1).fill(0))
      .map(function(row, i) {
        if (i == 0) {
          return array.slice(1).map(function(val) {
            return math.subtract(0,math.divide(val, array[0]));
          });
        }
        return row.map(function(_, j) {
          return j == i - 1 ? 1 : 0;
        });
      })
  };

  var IminusA = math.subtract(math.eye(n - 1), math.transpose(companion(a)));
  var B = b.slice(1).map(function(val, index) {
    return val - a[index + 1] * b[0];
  });

  // Solve zi = A*zi + B
  return math.lusolve(IminusA, B)._data.map(parseFloat);
};