$(document).ready(function () {
  /* global CalcCascades, Filter */
  'use strict';

  var input = document.getElementById('f_val');
  var sim = document.getElementById('f_sim');
  var output = document.getElementById('f_res');
  var c = document.getElementById('f_coeffs');

  var filterCalculator = new CalcCascades();

  var coeffsBessel = filterCalculator.getCoefficients({
    order: 3,
    characteristic: 'bessel',
    behavior: 'lowpass',
    Fs: 96000,
    Fc: 9600
  });

  var coeffsButterworth = filterCalculator.getCoefficients({
    order: 3,
    characteristic: 'butterworth',
    behavior: 'lowpass',
    Fs: 96000,
    Fc: 9600
  });

  c.innerHTML = 'Bessel: ' + JSON.stringify(coeffsBessel) + '<br><br>' + 'Butterworth: ' + JSON.stringify(coeffsButterworth) + '<br><br>';
  var filterBessel = new Filter(coeffsBessel);
  var filterButterworth = new Filter(coeffsButterworth);
  var outBessel = [];
  var outButterworth = [];
  var ostr = '';
  var cnt = 0;
  sim.onclick = function () {
    var val = input.value;
    outBessel.push(filterBessel.singleStep(val));
    outButterworth.push(filterButterworth.singleStep(val));
    ostr += cnt + ':' + outBessel[outBessel.length - 1] + ' ' + outButterworth[outButterworth.length - 1] + '<br>';
    cnt++;
    output.innerHTML = ostr;
  };

});
