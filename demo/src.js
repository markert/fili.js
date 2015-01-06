$(document).ready(function () {
  /* global CalcCascades, FirFilter, CalcCascades, FirCoeffs, IirFilter, TestFilter */
  'use strict';

  var fs = document.getElementById('fs_val');
  var fc = document.getElementById('fc_val');
  var io = document.getElementById('iir_val');
  var fo = document.getElementById('fir_val');
  var buir = document.getElementById('buir_val');
  var beir = document.getElementById('beir_val');
  var sim = document.getElementById('f_sim');
  var iirtxt = document.getElementById('iirtxt');
  var iirbtxt = document.getElementById('iirbtxt');

  var inval = document.getElementById('in_val');
  var run = document.getElementById('f_run');

  fs.value = 1000;
  fc.value = 100;
  io.value = 3;
  fo.value = 100;
  beir.value = 20;
  buir.value = 40;
  inval.value = 1;

  var besselOut = [];
  var butterworthOut = [];
  var firOut = [];
  var unfilteredOut = [];
  var iirCalculator = new CalcCascades();
  var firCalculator = new FirCoeffs();
  var filterBessel, filterButterworth, filterFir;
  var runCounter = 0;

  sim.onclick = function () {

    besselOut.length = 0;
    butterworthOut.length = 0;
    firOut.length = 0;
    unfilteredOut.length = 0;
    runCounter = 0;

    var coeffsBessel = iirCalculator.lowpass({
      order: io.value,
      characteristic: 'bessel',
      Fs: fs.value,
      Fc: fc.value
    });

    var coeffsButterworth = iirCalculator.lowpass({
      order: io.value,
      characteristic: 'butterworth',
      Fs: fs.value,
      Fc: fc.value
    });

    var coeffsFir = firCalculator.lowpass({
      order: fo.value,
      Fs: fs.value,
      Fc: fc.value
    });

    var cnt = 0;
    var beautifyZ = function (zo) {
      var str = '';
      for (var k = 0; k < zo.length; k++) {
        str += 'stage ' + (k + 1) + ': ';
        str += 'Zeros: ' + JSON.stringify(zo[k].z) + ' ___|||||___ ';
        str += 'Poles: ' + JSON.stringify(zo[k].p) + '<br>';
      }
      return str;
    };

    filterBessel = new IirFilter(coeffsBessel);
    filterButterworth = new IirFilter(coeffsButterworth);
    filterFir = new FirFilter(coeffsFir);
    var pzButterworth = filterButterworth.polesZeros();
    iirbtxt.innerHTML = beautifyZ(pzButterworth);
    var colors = ['#00FF00', '#FF0000', '#0000FF'];
    var options = {
      xaxis: {
        min: -1,
        max: 1
      },
      yaxis: {
        min: -1,
        max: 1
      },
      grid: {
        markings: [{
          yaxis: {
            from: 0,
            to: 0
          },
          color: "#000"
        }, {
          xaxis: {
            from: 0,
            to: 0
          },
          color: "#000"
        }],
        markingsLineWidth: 1
      }
    };
    var xSign = function (ctx, x, y, radius) {
      var size = radius * Math.sqrt(Math.PI) / 2;
      ctx.moveTo(x - size, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.moveTo(x - size, y + size);
      ctx.lineTo(x + size, y - size);
    };
    var iirBuPz = [];
    for (cnt = 0; cnt < pzButterworth.length; cnt++) {
      iirBuPz[2 * cnt] = {
        data: [
          [pzButterworth[cnt].p[0].re, pzButterworth[cnt].p[0].im],
          [pzButterworth[cnt].p[1].re, pzButterworth[cnt].p[1].im]
        ],
        color: colors[cnt],
        points: {
          radius: 4,
          show: true,
          symbol: xSign
        }
      };
      iirBuPz[2 * cnt + 1] = {
        data: [
          [pzButterworth[cnt].z[0].re, pzButterworth[cnt].z[0].im],
          [pzButterworth[cnt].z[1].re, pzButterworth[cnt].z[1].im]
        ],
        color: colors[cnt],
        points: {
          radius: 4,
          show: true
        }
      };
    }
    $.plot($('#iirbpz'), iirBuPz,
      options
    );
    var pzBessel = filterBessel.polesZeros();
    iirtxt.innerHTML = beautifyZ(pzBessel);
    var iirBePz = [];
    for (cnt = 0; cnt < pzBessel.length; cnt++) {
      iirBePz[2 * cnt] = {
        data: [
          [pzBessel[cnt].p[0].re, pzBessel[cnt].p[0].im],
          [pzBessel[cnt].p[1].re, pzBessel[cnt].p[1].im]
        ],
        color: colors[cnt],
        points: {
          radius: 3,
          show: true,
          symbol: xSign
        }
      };
      iirBePz[2 * cnt + 1] = {
        data: [
          [pzBessel[cnt].z[0].re, pzBessel[cnt].z[0].im],
          [pzBessel[cnt].z[1].re, pzBessel[cnt].z[1].im]
        ],
        color: colors[cnt],
        points: {
          radius: 3,
          show: true
        }
      };
    }
    $.plot($('#iirpz'), iirBePz,
      options);
    var tc = iirCalculator.lowpass({
      order: io.value,
      characteristic: 'butterworth',
      Fs: fs.value,
      Fc: fc.value
    });
    var tf = new IirFilter(tc);
    var tester = new TestFilter(tf);
    console.log(tester.directedRandomStability({
      steps: 10000,
      tests: 100,
      offset: 5,
      maxStable: 20,
      minStable: -7,
      pp: 10,
      setup: 1000
    }));
    var iirBeRe = filterBessel.response(480);
    var iirBeReMag = [];
    var fss = fs.value;
    for (cnt = 0; cnt < iirBeRe.length; cnt++) {
      iirBeReMag.push([fss / 2 * cnt / iirBeRe.length, iirBeRe[cnt].magnitude]);
    }
    $.plot($('#iirmag'), [{
      data: iirBeReMag,
      color: '#FF0000'
    }]);
    var iirBeReGrp = [];
    for (cnt = 0; cnt < iirBeRe.length; cnt++) {
      iirBeReGrp.push([fss / 2 * cnt / iirBeRe.length, iirBeRe[cnt].groupDelay]);
    }
    $.plot($('#iirgroup'), [{
      data: iirBeReGrp,
      color: '#FF0000'
    }]);
    var iirBeReSr = filterBessel.impulseResponse(beir.value);
    var iirBeReImp = [];
    for (cnt = 0; cnt < iirBeReSr.out.length; cnt++) {
      iirBeReImp.push([cnt, iirBeReSr.out[cnt]]);
    }
    $.plot($('#iirimp'), [{
      data: iirBeReImp,
      color: '#FF0000'
    }]);

    var iirBuRe = filterButterworth.response(480);
    var iirBuReMag = [];
    for (cnt = 0; cnt < iirBuRe.length; cnt++) {
      iirBuReMag.push([fss / 2 * cnt / iirBuRe.length, iirBuRe[cnt].magnitude]);
    }
    $.plot($('#iirbmag'), [{
      data: iirBuReMag,
      color: '#00FF00'
    }]);
    var iirBuReGrp = [];
    for (cnt = 0; cnt < iirBuRe.length; cnt++) {
      iirBuReGrp.push([fss / 2 * cnt / iirBuRe.length, iirBuRe[cnt].groupDelay]);
    }
    $.plot($('#iirbgroup'), [{
      data: iirBuReGrp,
      color: '#00FF00'
    }]);
    var iirBuReSr = filterButterworth.impulseResponse(buir.value);
    var iirBuReImp = [];
    for (cnt = 0; cnt < iirBuReSr.out.length; cnt++) {
      iirBuReImp.push([cnt, iirBuReSr.out[cnt]]);
    }
    $.plot($('#iirbimp'), [{
      data: iirBuReImp,
      color: '#00FF00'
    }]);

    var firRe = filterFir.response(480);

    var firReMag = [];
    for (cnt = 0; cnt < firRe.length; cnt++) {
      firReMag.push([fss / 2 * cnt / firRe.length, firRe[cnt].dBmagnitude]);
    }
    $.plot($('#firmag'), [{
      data: firReMag,
      color: '#0000FF'
    }]);
    var firReGrp = [];
    for (cnt = 0; cnt < firRe.length; cnt++) {
      firReGrp.push([fss / 2 * cnt / firRe.length, firRe[cnt].groupDelay]);
    }
    $.plot($('#firgroup'), [{
      data: firReGrp,
      color: '#0000FF'
    }]);

    var firReImp = [];
    for (cnt = 0; cnt < coeffsFir.length; cnt++) {
      firReImp.push([cnt, coeffsFir[cnt]]);
    }
    $.plot($('#firimp'), [{
      data: firReImp,
      color: '#0000FF'
    }]);
  };

  run.onclick = function () {
    besselOut.push([runCounter, filterBessel.singleStep(parseFloat(inval.value))]);
    butterworthOut.push([runCounter, filterButterworth.singleStep(parseFloat(inval.value))]);
    firOut.push([runCounter, filterFir.singleStep(parseFloat(inval.value))]);
    unfilteredOut.push([runCounter, parseFloat(inval.value)]);
    runCounter++;
    $.plot($('#unrun'), [{
      data: unfilteredOut,
      color: '#FFFF00',
      label: 'Original'
    }, {
      data: besselOut,
      color: '#FF0000',
      label: 'Bessel'
    }, {
      data: butterworthOut,
      color: '#00FF00',
      label: 'Butterworth'
    }, {
      data: firOut,
      color: '#0000FF',
      label: 'FIR'
    }]);
  };
  $.plot($('#unrun'), [{
    data: unfilteredOut,
    color: '#FFFF00',
    label: 'original'
  }, {
    data: besselOut,
    color: '#FF0000',
    label: 'bessel'
  }, {
    data: butterworthOut,
    color: '#00FF00',
    label: 'butterworth'
  }, {
    data: firOut,
    color: '#0000FF',
    label: 'FIR'
  }]);

  sim.click();

});
