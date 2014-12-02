  'use strict';

  var evaluatePhase = function (res) {
    var xcnt = 0;
    var cnt = 0;
    var pi = Math.PI;
    var tpi = 2 * pi;
    var phase = [];
    for (cnt = 0; cnt < res.length; cnt++) {
      phase.push(res[cnt].phase);
    }
    res[0].unwrappedPhase = res[1].unwrappedPhase;
    for (cnt = 1; cnt < phase.length; cnt++) {
      var diff = phase[cnt] - phase[cnt - 1];
      if (diff > pi) {
        for (xcnt = cnt; xcnt < phase.length; xcnt++) {
          phase[xcnt] -= tpi;
        }
      } else if (diff < -pi) {
        for (xcnt = cnt; xcnt < phase.length; xcnt++) {
          phase[xcnt] += tpi;
        }
      }
      if (phase[cnt] < 0) {
        res[cnt].unwrappedPhase = -phase[cnt];
      } else {
        res[cnt].unwrappedPhase = phase[cnt];
      }

      res[cnt].phaseDelay = res[cnt].unwrappedPhase / (cnt / res.length);
      res[cnt].groupDelay = (res[cnt].unwrappedPhase - res[cnt - 1].unwrappedPhase) / (1 / res.length);
    }
    res[0].unwrappedPhase = res[1].unwrappedPhase;
    res[0].phaseDelay = res[1].phaseDelay;
    res[0].groupDelay = res[1].groupDelay;
  };
