'use strict';

var Wt = require('./wt');

var wcalc = new Wt({
  bufferSize: 10000,
  depth: 6
});

var b = [];

var samples = 64;

//var buf = [32.0, 10.0, 20.0, 38.0, 37.0, 28.0, 38.0, 34.0, 18.0, 24.0, 18.0, 9.0, 23.0, 24.0, 28.0, 34.0];

for (var cnt = 0; cnt < samples; cnt++) {
  b.push(Math.sin(2 * Math.PI * cnt / samples));
}
/*
for (var cnt = 0; cnt < buf.length; cnt++) {
  b.push(buf[cnt]);
}
*/
wcalc.pushData(b);
wcalc.enableDWT();
var wb = wcalc.calculate();
console.log(wcalc.necessarySamples());
//console.log(wb[0].highpassPointer);
for (var cnt = 0; cnt < wb.length; cnt++) {
  console.log('----------------------------------------------------------', cnt);
  //  console.log(wb[cnt].highpassPointer);
  for (var ccnt = 0; ccnt < wb[cnt].lowpassPointer; ccnt++) {
    console.log(wb[cnt].highpassData[ccnt]);
  }
}
