$(document).ready(function () {
  /* global streamchief, signalviews */
  'use strict';

  var input = document.getElementById('f_val');
  var sim = document.getElementById('f_sim');
  var output = document.getElementById('f_res');
  var c = document.getElementById('f_coeffs');

  var coeffsCalculator = new CalcCoeffs();
  // Bessel
  //1.02331395383  0.611194546878 0.510317824749
  //1.9047076123    1.68916826762   1.60391912877 
  var coeffs_Bessel = [];
  coeffs_Bessel.push(coeffsCalculator.lowpass({
    Q: 1.02331395383,
    Fs: 96000,
    Fc: 1.9047076123 * 9600
  }));
  coeffs_Bessel.push(coeffsCalculator.lowpass({
    Q: 0.611194546878,
    Fs: 96000,
    Fc: 1.68916826762 * 9600
  }));
  coeffs_Bessel.push(coeffsCalculator.lowpass({
    Q: 0.510317824749,
    Fs: 96000,
    Fc: 1.60391912877 * 9600
  }));

  // Buuterworth
  //0.541  0.707 1.93
  //1    1   1
  var coeffs_Butterworth = [];
  coeffs_Butterworth.push(coeffsCalculator.lowpass({
    Q: 0.541,
    Fs: 96000,
    Fc: 9600
  }));
  coeffs_Butterworth.push(coeffsCalculator.lowpass({
    Q: 0.707,
    Fs: 96000,
    Fc: 9600
  }));
  coeffs_Butterworth.push(coeffsCalculator.lowpass({
    Q: 1.93,
    Fs: 96000,
    Fc: 9600
  }));

  c.innerHTML = 'Bessel: ' + JSON.stringify(coeffs_Bessel) + '<br><br>' + 'Butterworth: ' + JSON.stringify(coeffs_Butterworth) + '<br><br>';
  var filterBessel = new Filter(coeffs_Bessel);
  var filterButterworth = new Filter(coeffs_Butterworth);
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
