'use strict';

var Wt = function (params) {

  var bufferSize = params.bufferSize || 100000;
  var transformAlgorithm = 'CWT';
  var waveletDepth = params.depth || 2;

  var waveletCoeffs = {};
  var waveletBuffer = [];

  var waveData = {
    lowpassData: new Float64Array(bufferSize),
    pointer: 0
  }

  // Orthogonal Daubechies coefficients
  // from https://en.wikipedia.org/wiki/Daubechies_wavelet

  var getCoefficients = function (radix) {
    var coeffs = {
      D2: {
        lp: [1.0, 1.0],
        hp: [1.0, -1.0]
      },

      D4: {
        lp: [0.6830127, 1.1830127, 0.3169873, -0.1830127],
        hp: [-0.1830127, -0.3169873, 1.1830127, -0.6830127]
      },

      D6: {
        lp: [0.47046721, 1.14111692, 0.650365, -0.19093442, -0.12083221, 0.0498175],
        hp: [0.0498175, 0.12083221, -0.19093442, -0.650365, 1.14111692, -0.47046721]
      },
      D8: {
        lp: [0.32580343, 1.01094572, 0.8922014, -0.03957503, -0.26450717, 0.0436163, 0.0465036, -0.01498699],
        hp: [-0.01498699, -0.0465036, 0.0436163, 0.26450717, -0.03957503, -0.8922014, 1.01094572, -0.32580343]
      },
      D10: {
        lp: [0.22641898, 0.85394354, 1.02432694, 0.19576696, -0.34265671, -0.04560113, 0.10970265, -0.00882680, -0.01779187, 4.71742793e-3],
        hp: [4.71742793e-3, 0.01779187, -0.00882680, -0.10970265, -0.04560113, 0.34265671, 0.19576696, -1.02432694, 0.85394354, -0.22641898]
      }
    }
    if (coeffs[radix]) {
      return coeffs[radix];
    } else {
      return coeffs.D2;
    }
  }

  var resetBuffer = function () {
    for (var cnt = 0; cnt < waveletBuffer.length; cnt++) {
      waveletBuffer[cnt].highpassPointer = 0;
      waveletBuffer[cnt].lowpassPointer = 0;
    }
    waveData.pointer = 0;
  }

  var calculateCWT = function () {
    for (var cnt = 0; cnt < waveletDepth; cnt++) {
      var steps = Math.floor(Math.pow(2, cnt - 1 + waveletCoeffs.lp.length / 2));
      var buffer = waveletBuffer[cnt];
      var data = waveData;
      if (cnt > 0) {
        data = waveletBuffer[cnt - 1];
      }
      for (var dcnt = 0; dcnt < steps; dcnt++) {
        buffer.lowpassData[dcnt + buffer.lowpassPointer] = 0;
        buffer.highpassData[dcnt + buffer.highpassPointer] = 0;
        for (var rcnt = 0; rcnt < waveletCoeffs.lp.length; rcnt++) {
          buffer.lowpassData[dcnt + buffer.lowpassPointer] += waveletCoeffs.lp[rcnt] / 2 + data.lowpassData[dcnt + rcnt * Math.pow(2, cnt)];
          buffer.highpassData[dcnt + buffer.highpassPointer] += waveletCoeffs.hp[rcnt] / 2 + data.lowpassData[dcnt + rcnt * Math.pow(2, cnt)];
        }
      }
      buffer.lowpassPointer += steps;
      buffer.highpassPointer += steps;
      buffer.lowpassData.set(buffer.lowpassData.subarray(steps, buffer.lowpassPointer));
      buffer.lowpassPointer -= steps;
    }
  }

  var calculateDWT = function () {
    var steps = Math.floor((waveletCoeffs.lp.length - 2) / 2);
    var buffer = waveletBuffer[cnt];
    var data = waveData;
    if (cnt > 0) {
      data = waveletBuffer[cnt - 1];
    }
    for (var dcnt = 0; dcnt < steps; dcnt++) {
      nextBuffer.lowpassData[dcnt + nextBuffer.lowpassPointer] = 0;
      buffer.highpassData[dcnt + buffer.highpassPointer] = 0;
      for (var rcnt = 0; rcnt < waveletCoeffs.lp.length; rcnt++) {
        buffer.lowpassData[dcnt + nextBuffer.lowpassPointer] += waveletCoeffs.lp[rcnt] + data.lowpassData[2 * dcnt + rcnt];
        buffer.highpassData[dcnt + buffer.highpassPointer] += waveletCoeffs.hp[rcnt] + data.lowpassData[2 * dcnt + rcnt];
      }
    }
    buffer.lowpassPointer += steps;
    buffer.highpassPointer += steps;
    buffer.lowpassData.set(buffer.lowpassData.subarray(2 * steps, buffer.lowpassPointer));
    buffer.lowpassPointer -= 2 * steps;
  }

  var setDepth = function (depth) {
    if (depth !== 2 && depth !== 4 && depth !== 6 && depth !== 8 && depth !== 10) {
      return false;
    }
    waveletCoeffs = getCoefficients('D' + depth);
    if (depth > waveletBuffer.length) {
      for (var cnt = waveletBuffer.length; cnt < depth; cnt++) {
        waveletBuffer.push({
          highpassData: new Float64Array(bufferSize),
          lowpassData: new Float64Array(bufferSize),
          highpassPointer: 0,
          lowpassPointer: 0
        });
      }
    } else if (depth <= waveletBuffer.length) {
      waveletBuffer.length = depth;
    }
    resetBuffer();
    return true;
  };

  setDepth(waveletDepth);

  var self = {
    enableCWT: function () {
      transformAlgorithm = 'CWT';
    },
    enableDWT: function () {
      transformAlgorithm = 'DWT';
    },
    resetBuffer: function () {
      resetBuffer();
    },
    pushData: function (b) {
      waveData.lowpassData.set(b, waveData.pointer);
      waveData.pointer += b.length;
    },
    bufferLength: function () {
      return waveData.pointer;
    },
    calculate: function () {
      if (transformAlgorithm === 'CWT') {
        calculateCWT();
      } else {
        calculateDWT();
      }
    }
  }
  return self;
}

module.exports = Wt;
