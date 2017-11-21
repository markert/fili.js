$(document).ready(function () {
  /* global Fili, d3draw, $ */
  'use strict'

  var fs = document.getElementById('fs_val')
  var fc = document.getElementById('fc_val')
  var fc2 = document.getElementById('fc2_val')
  var io = document.getElementById('iir_val')
  var fo = document.getElementById('fir_val')
  var buir = document.getElementById('buir_val')
  var sim = document.getElementById('f_sim')
  var iirtxt = document.getElementById('iirtxt')
  var coefftxt = document.getElementById('coefftxt')
  var pregain = document.getElementById('pregain')
  var gain = document.getElementById('gain')

  var seltrans = document.getElementById('seltrans')
  var seltype = document.getElementById('seltype')
  var bilinearchar = document.getElementById('bilinearchar')
  var bilineartype = document.getElementById('bilineartype')
  var matchedzchar = document.getElementById('matchedzchar')
  var firtype = document.getElementById('firtype')
  var firatt = document.getElementById('firatt')

  var inval = document.getElementById('in_val')
  var run = document.getElementById('f_run')

  var toggleFir = function (p) {
    firtype.disabled = p
    firatt.disabled = p
    fo.disabled = p
    fc2.disabled = p
  }

  var toggleIir = function (p) {
    io.disabled = p
    bilinearchar.disabled = p
    bilineartype.disabled = p
    matchedzchar.disabled = p
    buir.disabled = p
    seltrans.disabled = p
    gain.disabled = p
    pregain.disabled = p
  }

  var toggleBilinear = function (p) {
    bilinearchar.disabled = !p
    bilineartype.disabled = !p
    matchedzchar.disabled = p
    gain.disabled = !p
  }

  seltype.onchange = function () {
    var sel = seltype.options[seltype.selectedIndex].value
    if (sel === 'iir') {
      toggleFir(true)
      toggleIir(false)
    } else {
      toggleFir(false)
      toggleIir(true)
    }
  }

  seltrans.onchange = function () {
    var sel = seltrans.options[seltrans.selectedIndex].value
    if (sel === 'bilinear') {
      toggleBilinear(true)
    } else {
      toggleBilinear(false)
    }
  }

  toggleFir(true)
  toggleIir(false)
  toggleBilinear(true)

  fs.value = 1000
  fc.value = 100
  io.value = 3
  fo.value = 100
  buir.value = 40
  inval.value = 1

  var unfilteredOut = []
  var iirCalculator = new Fili.CalcCascades()
  var firCalculator = new Fili.FirCoeffs()
  var runCounter = 0

  var filter = {}

  var cnt = 0

  var beautifyZ = function (zo) {
    var str = ''
    for (var k = 0; k < zo.length; k++) {
      str += 'stage ' + (k + 1) + ':<br>'
      str += 'Zeros: ' + JSON.stringify(zo[k].z) + '<br>'
      str += 'Poles: ' + JSON.stringify(zo[k].p) + '<br>'
    }
    return str
  }

  var beautifyCoeffs = function (c) {
    var str = ''
    for (var k = 0; k < c.length; k++) {
      str += 'stage ' + (k + 1) + ':<br>'
      str += 'k: ' + c[k].k + '<br>'
      str += 'a1: ' + c[k].a[0] + ' | a2: ' + c[k].a[1] + '<br>'
      str += 'b0: ' + c[k].b[0] + ' | b1: ' + c[k].b[1] + ' | b2: ' + c[k].b[2] + '<br>'
    }
    str += '<br>'
    return str
  }

  var beautifyCoeffsBin = function (c) {
    var str = ''
    for (var k = 0; k < c.length; k++) {
      str += 'stage (binary)' + (k + 1) + ':<br>'
      str += 'k: ' + c[k].k.toString(2) + ' (' + c[k].k.toString(2).split('.').pop().length + ')' + '<br>'
      str += 'a1: ' + c[k].a[0].toString(2) + ' (' + c[k].a[0].toString(2).split('.').pop().length + ')' + ' | a2: ' + c[k].a[1].toString(2) + ' (' + c[k].a[1].toString(2).split('.').pop().length + ')' + '<br>'
      str += 'b0: ' + c[k].b[0].toString(2) + ' (' + c[k].b[0].toString(2).split('.').pop().length + ')' + ' | b1: ' + c[k].b[1].toString(2) + ' (' + c[k].b[1].toString(2).split('.').pop().length + ')' + ' | b2: ' + c[k].b[2].toString(2) + ' (' + c[k].b[2].toString(2).split('.').pop().length + ')' + '<br>'
    }
    return str
  }

  var beautifyFirCoeffs = function (c) {
    var str = ''
    for (var k = 0; k < c.length; k++) {
      str += 'stage ' + (k + 1) + ': ' + c[k] + '<br>'
    }
    return str
  }

  sim.onclick = function () {
    runCounter = 0
    unfilteredOut = []
    filter.out = []
    filter.type = seltype.options[seltype.selectedIndex].value
    filter.sampling = fs.value
    filter.cutoffLow = fc.value
    filter.cutoffHigh = fc2.value
    filter.gain = gain.value
    filter.preGain = pregain.checked

    if (filter.type === 'iir') {
      filter.calculation = seltrans.options[seltrans.selectedIndex].value
      filter.order = io.value
      if (filter.calculation === 'bilinear') {
        filter.behavior = bilineartype.options[bilineartype.selectedIndex].value
        filter.characteristic = bilinearchar.options[bilinearchar.selectedIndex].value
        filter.oneDb = false
        if (filter.characteristic === 'bessel1dB') {
          filter.characteristic = 'bessel'
          filter.oneDb = true
        } else if (filter.characteristic === 'bessel3dB') {
          filter.characteristic = 'bessel'
        }

        filter.coeffs = iirCalculator[filter.behavior]({
          order: filter.order,
          characteristic: filter.characteristic,
          Fs: filter.sampling,
          Fc: filter.cutoffLow,
          gain: filter.gain,
          oneDb: filter.oneDb,
          preGain: filter.preGain
        })
      } else {
        filter.behavior = 'lowpass'
        filter.characteristic = matchedzchar.options[matchedzchar.selectedIndex].value
        filter.coeffs = iirCalculator.lowpass({
          order: filter.order,
          characteristic: filter.characteristic,
          Fs: filter.sampling,
          Fc: filter.cutoffLow,
          transform: 'matchedZ',
          preGain: filter.preGain
        })
      }
      filter.instance = new Fili.IirFilter(filter.coeffs)

      filter.pz = filter.instance.polesZeros()
      filter.impulseResponse = filter.instance.impulseResponse(buir.value)
      filter.resp = []
      for (cnt = 0; cnt < filter.impulseResponse.out.length; cnt++) {
        filter.resp.push([cnt, filter.impulseResponse.out[cnt]])
      }

      iirtxt.innerHTML = beautifyZ(filter.pz)

      d3draw.polar({
        values: filter.pz,
        element: '#iirpz3d',
        width: 350,
        height: 350
      })

      coefftxt.innerHTML = beautifyCoeffs(filter.coeffs) + beautifyCoeffsBin(filter.coeffs)
    } else {
      filter.calculation = firtype.options[firtype.selectedIndex].value
      filter.order = fo.value
      if (filter.calculation !== 'kb') {
        var c = 'lowpass'
        if (filter.calculation === 'sinc_hp') {
          c = 'highpass'
        } else if (filter.calculation === 'sinc_bp') {
          c = 'bandpass'
        } else if (filter.calculation === 'sinc_bs') {
          c = 'bandstop'
        }
        filter.coeffs = firCalculator[c]({
          order: filter.order,
          Fs: filter.sampling,
          Fc: filter.cutoffLow,
          F1: filter.cutoffLow,
          F2: filter.cutoffHigh
        })
      } else {
        filter.attenuation = firatt.value
        filter.coeffs = firCalculator.kbFilter({
          order: filter.order,
          Fs: filter.sampling,
          Fa: filter.cutoffLow,
          Fb: filter.cutoffHigh,
          Att: filter.attenuation
        })
      }

      filter.instance = new Fili.FirFilter(filter.coeffs)

      filter.resp = []
      for (cnt = 0; cnt < filter.coeffs.length; cnt++) {
        filter.resp.push([cnt, filter.coeffs[cnt]])
      }
      d3draw.polar({
        values: [],
        element: '#iirpz3d',
        width: 350,
        height: 350
      })
      iirtxt.innerHTML = 'No poles/zeroes for FIR filters'
      coefftxt.innerHTML = beautifyFirCoeffs(filter.coeffs)
    }

    filter.response = filter.instance.response(480)
    filter.magnitude = []
    filter.magnitudedB = []
    filter.groupDelay = []
/*
    $.plot($('#iirimp'), [{
      data: filter.resp,
      color: '#FF0000'
    }]);
*/
    d3draw.linestrip({
      values: filter.resp,
      element: '#iirimp3d',
      width: 600,
      height: 350,
      xLabel: 'Time [samples]',
      yLabel: 'Input Value',
      xFormatter: function (v) {
        return v.toFixed(2) + ' s'
      },
      yFormatter: function (v) {
        return (v).toFixed(2) + ''
      }
    })

    for (cnt = 0; cnt < filter.response.length; cnt++) {
      filter.magnitude.push([filter.sampling / 2 * cnt / filter.response.length, filter.response[cnt].magnitude])
      filter.magnitudedB.push([filter.sampling / 2 * cnt / filter.response.length, filter.response[cnt].dBmagnitude])
      filter.groupDelay.push([filter.sampling / 2 * cnt / filter.response.length, filter.response[cnt].groupDelay])
    }

    d3draw.linestrip({
      values: filter.magnitude,
      element: '#iirmag3d',
      width: 600,
      height: 350,
      xLabel: 'Frequency [Hz]',
      yLabel: 'Attenuation [%]',
      xFormatter: function (v) {
        return v.toFixed(2) + ' Hz'
      },
      yFormatter: function (v) {
        return (100 * v).toFixed(2) + ' %'
      }
    })

    d3draw.linestrip({
      values: filter.magnitudedB,
      element: '#iirbmag3d',
      width: 600,
      height: 350,
      xLabel: 'Frequency [Hz]',
      yLabel: 'Attenuation [dB]',
      xFormatter: function (v) {
        return v.toFixed(2) + ' Hz'
      },
      yFormatter: function (v) {
        return v.toFixed(2) + ' dB'
      }
    })

    d3draw.linestrip({
      values: filter.groupDelay,
      element: '#iirgroup3d',
      width: 600,
      height: 350,
      xLabel: 'Frequency [Hz]',
      yLabel: 'Group Delay [samples]',
      xFormatter: function (v) {
        return v.toFixed(2) + ' Hz'
      },
      yFormatter: function (v) {
        return v.toFixed(2) + ''
      }
    })

    d3draw.linestrip({
      values1: unfilteredOut,
      values: filter.out,
      element: '#unrun3d',
      width: 600,
      height: 350,
      xLabel: 'Time [samples]',
      yLabel: 'Input Value',
      xFormatter: function (v) {
        return v.toFixed(2) + ' s'
      },
      yFormatter: function (v) {
        return (v).toFixed(2) + ''
      }
    })
  }

  run.onclick = function () {
    filter.out.push([runCounter, filter.instance.singleStep(parseFloat(inval.value))])
    unfilteredOut.push([runCounter, parseFloat(inval.value)])
    runCounter++
    d3draw.linestrip({
      values1: unfilteredOut,
      values: filter.out,
      element: '#unrun3d',
      width: 600,
      height: 350,
      xLabel: 'Time [samples]',
      yLabel: 'Input Value',
      xFormatter: function (v) {
        return v.toFixed(2) + ' s'
      },
      yFormatter: function (v) {
        return (v).toFixed(2) + ''
      }
    })
  }

  sim.click()
})
