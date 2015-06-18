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
  var iirCalculator = new Fili.CalcCascades();
  var firCalculator = new Fili.FirCoeffs();
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

    filterBessel = new Fili.IirFilter(coeffsBessel);
    filterButterworth = new Fili.IirFilter(coeffsButterworth);
    filterFir = new Fili.FirFilter(coeffsFir);
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
    $.plot($('#iirbpz'), iirBuPz, options);
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
    $.plot($('#iirpz'), iirBePz, options);
    var tc = iirCalculator.lowpass({
      order: io.value,
      characteristic: 'butterworth',
      Fs: fs.value,
      Fc: fc.value
    });
    var tf = new Fili.IirFilter(tc);
    var tester = new Fili.TestFilter(tf);
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



    var margin = {
      top: 35,
      right: 20,
      bottom: 50,
      left: 90
    };

    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var xMin = d3.min(iirBeReMag, function(d) {
      return d[0];
    });

    var xMax = d3.max(iirBeReMag, function(d) {
      return d[0];
    });

    var yMin = d3.min(iirBeReMag, function(d) {
      return d[1];
    });

    var yMax = d3.max(iirBeReMag, function(d) {
      return d[1];
    });


    var x = d3.scale.linear()
      .range([0, width])
      .domain([xMin, xMax]);

    var y = d3.scale.linear()
      .range([height, 0])
      .domain([yMin, yMax * 1.1]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(y)
      .ticks(10)
      .orient('left');

    var line = d3.svg.line()
      .x(function(d) {
        return x(d[0]);
      })
      .y(function(d) {
        return y(d[1]);
      });

    var parent = d3.select('#iirmag_d3')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    var svg = parent.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // horizontal grid
    svg.append('g')
      .selectAll('line.grid')
      .data(y.ticks(10))
      .enter()
      .append('line')
      .attr('class', 'grid')
      .attr('x1', 0)
      .attr('y1', function(d){ return y(d); })
      .attr('x2', width)
      .attr('y2', function(d){ return y(d); });

    // vertical grid
    svg.append('g')
      .selectAll('line.grid')
      .data(x.ticks(10))
      .enter()
      .append('line')
      .attr('class', 'grid')
      .attr('x1', function(d){ return x(d); })
      .attr('y1', 0)
      .attr('x2', function(d){ return x(d); })
      .attr('y2', height);

    // x axis
    svg.append('g')
     .attr('class', 'x axis')
     .attr('transform', 'translate(0,' + height + ')')
     .call(xAxis);

    // y axis
    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    // line
    svg.append('path')
      .datum(iirBeReMag)
      .attr('class', 'line')
      .attr('d', line);

    // x axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height + margin.bottom - 5) + ')')
      .text('Frequency [Hz]');

    // y axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + (-margin.left / 1.5) + ',' + (height / 2) + ') rotate(-90)')
      .text('Dämpfung [%]');

    // add label for current value when hovering
    var value = parent.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'translate(' + (width + margin.left) + ',' + (20) + ')')
      .text('');

    // area below line
    var area = d3.svg.area()
      .x(function(d) { return x(d[0]); })
      .y0(height)
      .y1(function(d) { return y(d[1]); });

    svg.append('path')
      .datum(iirBeReMag)
      .attr('class', 'area')
      .attr('d', area);

    // add mouse interaction - we need to have a transparent overlay to catch mouse events
    var bisect = d3.bisector(function(d) {
      return d[0];
    }).left;

    // add vertical line
    var hover = svg.append('line')
      .attr('class', 'hover')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', height);

    // add circle
    var circle = svg.append('circle')
      .attr('class', 'circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 4);

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'overlay')
      .on('mouseover', function() {
        circle
          .style('opacity', 1);
        hover
          .style('opacity', 1);
      })
      .on('mousemove', function() {
        var mouseX = d3.mouse(this)[0];
        var x0 = x.invert(mouseX);
        var i = bisect(iirBeReMag, x0);
        var y0 = iirBeReMag[i][1];

        // update hover line position
        hover
          .attr('x1', mouseX)
          .attr('x2', mouseX);

        // update circle position
        circle
          .attr('cx', mouseX)
          .attr('cy', y(y0));

        // update current value
        value.text('Frequency ' + x0.toFixed(2) + ' Hz, Attenuation ' + (y0 * 100).toFixed(2) + ' %');
      })
      .on('mouseout', function() {
        circle
          .style('opacity', 0);
        hover
          .style('opacity', 0);
      });



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
