'use strict';

var Wt = function (params) {

  var bufferSize = params.bufferSize || 100000;
  var transformAlgorithm = 'CWT';
  var waveletDepth = params.depth || 2;

  var waveletCoeffs = {};
  var waveletBuffer = [];

  var waveData = {
    lowpassData: new Float64Array(bufferSize),
    lowpassPointer: 0
  }

  // Orthogonal Daubechies coefficients
  // from https://en.wikipedia.org/wiki/Daubechies_wavelet

  var daubechies_coeffs = {
    D2: [1.0, 1.0],
    D4: [0.6830127, 1.1830127, 0.3169873, -0.1830127],
    D6: [0.47046721, 1.14111692, 0.650365, -0.19093442, -0.12083221, 0.0498175],
    D8: [0.32580343, 1.01094572, 0.8922014, -0.03957503, -0.26450717, 0.0436163, 0.0465036, -0.01498699],
    D10: [0.22641898, 0.85394354, 1.02432694, 0.19576696, -0.34265671, -0.04560113, 0.10970265, -0.00882680, -0.01779187, 4.71742793e-3],
    D12: [0.15774243, 0.69950381, 1.06226376, 0.44583132, -0.31998660, -0.18351806, 0.13788809, 0.03892321, -0.04466375, 7.83251152e-4, 6.75606236e-3, -1.52353381e-3],
    D14: [0.11009943, 0.56079128, 1.03114849, 0.66437248, -0.20351382, -0.31683501, 0.1008467, 0.11400345, -0.05378245, -0.02343994, 0.01774979, 6.07514995e-4, -2.54790472e-3, 5.00226853e-4],
    D16: [0.07695562, 0.44246725, 0.95548615, 0.82781653, -0.02238574, -0.40165863, 6.68194092e-4, 0.18207636, -0.02456390, -0.06235021, 0.01977216, 0.01236884, -6.88771926e-3, -5.54004549e-4, 9.55229711e-4, -1.66137261e-4],
    D18: [0.05385035, 0.34483430, 0.85534906, 0.92954571, 0.18836955, -0.41475176, -0.13695355, 0.21006834, 0.043452675, -0.09564726, 3.54892813e-4, 0.03162417, -6.67962023e-3, -6.05496058e-3, 2.61296728e-3, 3.25814671e-4, -3.56329759e-4, 5.5645514e-5],
    D20: [0.03771716, 0.26612218, 0.74557507, 0.97362811, 0.39763774, -0.35333620, -0.27710988, 0.18012745, 0.13160299, -0.10096657, -0.04165925, 0.04696981, 5.10043697e-3, -0.01517900, 1.97332536e-3, 2.81768659e-3, -9.69947840e-4, -1.64709006e-4, 1.32354367e-4, -1.875841e-5]
  }

  var getCoefficients = function (radix) {
    var dcoeffs = daubechies_coeffs[radix] || daubechies_coeffs.D2;
    var coeffs = {};
    coeffs.hp = [];
    coeffs.lp = [];
    coeffs.hp.length = dcoeffs.length;
    coeffs.lp.length = dcoeffs.length;

    for (var cnt = 0; cnt < dcoeffs.length; cnt++) {
      coeffs.lp[cnt] = dcoeffs[cnt];
      if (cnt % 2) {
        coeffs.hp[cnt] = -dcoeffs[dcoeffs.length - cnt - 1];
      } else {
        coeffs.hp[cnt] = dcoeffs[dcoeffs.length - cnt - 1];
      }
    }
    return coeffs;
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
      var buffer = waveletBuffer[cnt];
      var data = waveData;
      if (cnt > 0) {
        data = waveletBuffer[cnt - 1];
      }

      var steps = Math.floor(data.lowpassPointer - Math.pow(2, cnt - 1 + waveletDepth / 2));
      for (var dcnt = 0; dcnt < steps; dcnt++) {
        buffer.lowpassData[dcnt + buffer.lowpassPointer] = 0;
        buffer.highpassData[dcnt + buffer.highpassPointer] = 0;
        for (var rcnt = 0; rcnt < waveletDepth; rcnt++) {
          buffer.lowpassData[dcnt + buffer.lowpassPointer] += waveletCoeffs.lp[rcnt] / 2 * data.lowpassData[dcnt + rcnt * Math.pow(2, cnt)];
          buffer.highpassData[dcnt + buffer.highpassPointer] += waveletCoeffs.hp[rcnt] / 2 * data.lowpassData[dcnt + rcnt * Math.pow(2, cnt)];
        }
      }
      buffer.lowpassPointer += steps;
      buffer.highpassPointer += steps;
      if (cnt === 0) {
        data.lowpassPointer += steps;
      }
      data.lowpassData.set(data.lowpassData.subarray(steps, buffer.lowpassPointer));
      data.lowpassPointer -= steps;
    }
  }

  var calculateDWT = function () {
    for (var cnt = 0; cnt < waveletDepth; cnt++) {
      var buffer = waveletBuffer[cnt];
      var data = waveData;
      if (cnt > 0) {
        data = waveletBuffer[cnt - 1];
      }
      var steps = Math.ceil(data.lowpassPointer / 2);
      for (var dcnt = 0; dcnt < steps; dcnt++) {
        var bufferPos = dcnt + buffer.lowpassPointer;
        buffer.lowpassData[bufferPos] = 0;
        buffer.highpassData[bufferPos] = 0;
        for (var rcnt = 0; rcnt < waveletDepth; rcnt++) {
          buffer.lowpassData[bufferPos] += waveletCoeffs.lp[rcnt] * data.lowpassData[2 * dcnt + rcnt];
          buffer.highpassData[bufferPos] += waveletCoeffs.hp[rcnt] * data.lowpassData[2 * dcnt + rcnt];
        }
      }
      buffer.lowpassPointer += steps;
      buffer.highpassPointer += steps;
      if (cnt === 0) {
        data.lowpassPointer += steps;
      }
    }
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
    waveletDepth = depth;
    resetBuffer();
    return true;
  };

  var calculateNecessarySamples = function () {
    if (transformAlgorithm === 'DWT') {
      return Math.pow(waveletDepth, 2);
    } else {
      return 512; // TODO
    }
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
      waveData.lowpassData.set(b, waveData.lowpassPointer);
      waveData.lowpassPointer += b.length;
    },
    bufferLength: function () {
      return waveData.lowpassPointer;
    },
    sampleBuffer: function () {
      return waveData.lowpassData;
    },
    waveletBuffer: function () {
      return waveletBuffer;
    },
    necessarySamples: function () {
      return calculateNecessarySamples();
    },
    calculate: function () {
      if (transformAlgorithm === 'CWT') {
        calculateCWT();
      } else {
        calculateDWT();
      }
      return waveletBuffer;
    }
  }
  return self;
}

module.exports = Wt;
