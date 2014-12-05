describe('iir.js', function () {

  var iirCascadeCalculator;
  var iirSingleCalculator;

  before(function () {
    iirCascadeCalculator = new CalcCascades();
    iirSingleCalculator = new IirCoeffs();
  });

  after(function () {});
  describe('iir-bessel-notch', function () {

    var filterCoeffs, filter;
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.notch({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500
      });
      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.equal(1);

      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500,
        preGain: true
      });

      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.not.equal(1);
    });

    it('can generate a filter', function () {
      filter = new IirFilter(filterCoeffs);
      filter.should.be.an.Object;
    });

    it('can do a single step', function () {
      var out = filter.singleStep(10);
      out.should.be.a.Number;
      out.should.not.equal(0);
    });

    it('can do multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('can simulate multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates step response', function () {
      var r = filter.stepResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates filter response', function () {
      var r = filter.response(200);
      r.should.be.an.Array;
      r.length.should.equal(200);
      r[20].should.be.an.Object;
      r[20].magnitude.should.be.a.Number;
      r[20].dBmagnitude.should.be.a.Number;
      r[20].phase.should.be.a.Number;
      r[20].unwrappedPhase.should.be.a.Number;
      r[20].phaseDelay.should.be.a.Number;
      r[20].groupDelay.should.be.a.Number;

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      r.should.be.an.Array;
      r.length.should.equal(100);
    });

    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      });
      r.should.be.an.Object;
      r.magnitude.should.be.a.Number;
      r.dBmagnitude.should.be.a.Number;
      r.phase.should.be.a.Number;

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    it('reinit does not crash', function () {
      filter.reinit();
    });

  });

  describe('iir-bessel-lp', function () {

    var filterCoeffs, filter;
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500
      });
      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.equal(1);

      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500,
        preGain: true
      });

      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.not.equal(1);
    });

    it('can generate a filter', function () {
      filter = new IirFilter(filterCoeffs);
      filter.should.be.an.Object;
    });

    it('can do a single step', function () {
      var out = filter.singleStep(10);
      out.should.be.a.Number;
      out.should.not.equal(0);
    });

    it('can do multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('can simulate multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates step response', function () {
      var r = filter.stepResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates filter response', function () {
      var r = filter.response(200);
      r.should.be.an.Array;
      r.length.should.equal(200);
      r[20].should.be.an.Object;
      r[20].magnitude.should.be.a.Number;
      r[20].dBmagnitude.should.be.a.Number;
      r[20].phase.should.be.a.Number;
      r[20].unwrappedPhase.should.be.a.Number;
      r[20].phaseDelay.should.be.a.Number;
      r[20].groupDelay.should.be.a.Number;

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      r.should.be.an.Array;
      r.length.should.equal(100);
    });

    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      });
      r.should.be.an.Object;
      r.magnitude.should.be.a.Number;
      r.dBmagnitude.should.be.a.Number;
      r.phase.should.be.a.Number;

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    it('reinit does not crash', function () {
      filter.reinit();
    });

  });

  describe('iir-bessel-hp', function () {

    var filterCoeffs, filter;
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.highpass({
        order: 2,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500
      });
      filterCoeffs.length.should.equal(2);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.equal(1);

      filterCoeffs = iirCascadeCalculator.highpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500,
        preGain: true
      });

      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.not.equal(1);
    });

    it('can generate a filter', function () {
      filter = new IirFilter(filterCoeffs);
      filter.should.be.an.Object;
    });

    it('can do a single step', function () {
      var out = filter.singleStep(10);
      out.should.be.a.Number;
      out.should.not.equal(0);
    });

    it('can do multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('can simulate multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates step response', function () {
      var r = filter.stepResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates filter response', function () {
      var r = filter.response(200);
      r.should.be.an.Array;
      r.length.should.equal(200);
      r[20].should.be.an.Object;
      r[20].magnitude.should.be.a.Number;
      r[20].dBmagnitude.should.be.a.Number;
      r[20].phase.should.be.a.Number;
      r[20].unwrappedPhase.should.be.a.Number;
      r[20].phaseDelay.should.be.a.Number;
      r[20].groupDelay.should.be.a.Number;

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      r.should.be.an.Array;
      r.length.should.equal(100);
    });

    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      });
      r.should.be.an.Object;
      r.magnitude.should.be.a.Number;
      r.dBmagnitude.should.be.a.Number;
      r.phase.should.be.a.Number;

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    it('reinit does not crash', function () {
      filter.reinit();
    });

  });

  describe('iir-butterworth-hp', function () {

    var filterCoeffs, filter;
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.highpass({
        order: 3,
        characteristic: 'butterworth',
        Fs: 8000,
        Fc: 2234
      });
      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.equal(1);

      filterCoeffs = iirCascadeCalculator.highpass({
        order: 3,
        characteristic: 'butterworth',
        Fs: 8000,
        Fc: 1234,
        preGain: true
      });

      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.not.equal(1);
    });

    it('can generate a filter', function () {
      filter = new IirFilter(filterCoeffs);
      filter.should.be.an.Object;
    });

    it('can do a single step', function () {
      var out = filter.singleStep(10);
      out.should.be.a.Number;
      out.should.not.equal(0);
    });

    it('can do multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('can simulate multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates step response', function () {
      var r = filter.stepResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates filter response', function () {
      var r = filter.response(200);
      r.should.be.an.Array;
      r.length.should.equal(200);
      r[20].should.be.an.Object;
      r[20].magnitude.should.be.a.Number;
      r[20].dBmagnitude.should.be.a.Number;
      r[20].phase.should.be.a.Number;
      r[20].unwrappedPhase.should.be.a.Number;
      r[20].phaseDelay.should.be.a.Number;
      r[20].groupDelay.should.be.a.Number;

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      r.should.be.an.Array;
      r.length.should.equal(100);
    });

    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      });
      r.should.be.an.Object;
      r.magnitude.should.be.a.Number;
      r.dBmagnitude.should.be.a.Number;
      r.phase.should.be.a.Number;

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    it('reinit does not crash', function () {
      filter.reinit();
    });

  });

  describe('iir-butterworth-lp', function () {

    var filterCoeffs, filter;
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 2,
        characteristic: 'butterworth',
        Fs: 8000,
        Fc: 1234
      });
      filterCoeffs.length.should.equal(2);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.equal(1);

      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'butterworth',
        Fs: 8000,
        Fc: 1234,
        preGain: true
      });

      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.not.equal(1);
    });

    it('can generate a filter', function () {
      filter = new IirFilter(filterCoeffs);
      filter.should.be.an.Object;
    });

    it('can do a single step', function () {
      var out = filter.singleStep(10);
      out.should.be.a.Number;
      out.should.not.equal(0);
    });

    it('can do multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('can simulate multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates step response', function () {
      var r = filter.stepResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates filter response', function () {
      var r = filter.response(200);
      r.should.be.an.Array;
      r.length.should.equal(200);
      r[20].should.be.an.Object;
      r[20].magnitude.should.be.a.Number;
      r[20].dBmagnitude.should.be.a.Number;
      r[20].phase.should.be.a.Number;
      r[20].unwrappedPhase.should.be.a.Number;
      r[20].phaseDelay.should.be.a.Number;
      r[20].groupDelay.should.be.a.Number;

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      r.should.be.an.Array;
      r.length.should.equal(100);
    });

    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      });
      r.should.be.an.Object;
      r.magnitude.should.be.a.Number;
      r.dBmagnitude.should.be.a.Number;
      r.phase.should.be.a.Number;

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    it('reinit does not crash', function () {
      filter.reinit();
    });

  });

  describe('iir-butterworth-notch', function () {

    var filterCoeffs, filter;
    it('can calculate coeffs', function () {
      filterCoeffs = iirCascadeCalculator.notch({
        order: 3,
        characteristic: 'butterworth',
        Fs: 4000,
        Fc: 500
      });
      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.equal(1);

      filterCoeffs = iirCascadeCalculator.lowpass({
        order: 3,
        characteristic: 'bessel',
        Fs: 4000,
        Fc: 500,
        preGain: true
      });

      filterCoeffs.length.should.equal(3);
      filterCoeffs[0].should.be.an.Object;
      filterCoeffs[1].a.length.should.equal(2);
      filterCoeffs[1].b.length.should.equal(3);
      filterCoeffs[1].z.length.should.equal(2);
      filterCoeffs[1].z[0].should.equal(0);
      filterCoeffs[1].k.should.not.equal(1);
    });

    it('can generate a filter', function () {
      filter = new IirFilter(filterCoeffs);
      filter.should.be.an.Object;
    });

    it('can do a single step', function () {
      var out = filter.singleStep(10);
      out.should.be.a.Number;
      out.should.not.equal(0);
    });

    it('can do multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.multiStep(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('can simulate multiple steps', function () {
      var simInput = [];
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5);
      }
      var out = filter.simulate(simInput);
      out.should.be.an.Array;
      out.length.should.equal(10000);
      out[111].should.not.equal(simInput[111]);
    });

    it('calculates impulse response', function () {
      var r = filter.impulseResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates step response', function () {
      var r = filter.stepResponse(100);
      r.should.be.an.Object;
      r.out.should.be.an.Array;
      r.out.length.should.equal(100);
      r.min.should.be.an.Object;
      r.min.sample.should.be.a.Number;
      r.min.value.should.be.a.Number;
      r.max.should.be.an.Object;
      r.max.sample.should.be.a.Number;
      r.max.value.should.be.a.Number;
    });

    it('calculates filter response', function () {
      var r = filter.response(200);
      r.should.be.an.Array;
      r.length.should.equal(200);
      r[20].should.be.an.Object;
      r[20].magnitude.should.be.a.Number;
      r[20].dBmagnitude.should.be.a.Number;
      r[20].phase.should.be.a.Number;
      r[20].unwrappedPhase.should.be.a.Number;
      r[20].phaseDelay.should.be.a.Number;
      r[20].groupDelay.should.be.a.Number;

      r[20].magnitude.should.not.equal(0);
      r[20].dBmagnitude.should.not.equal(0);
      r[20].phase.should.not.equal(0);
      r[20].unwrappedPhase.should.not.equal(0);
      r[20].phaseDelay.should.not.equal(0);
      r[20].groupDelay.should.not.equal(0);

      r = filter.response();
      r.should.be.an.Array;
      r.length.should.equal(100);
    });

    it('calculates single filter response', function () {
      var r = filter.responsePoint({
        Fs: 4000,
        Fr: 211
      });
      r.should.be.an.Object;
      r.magnitude.should.be.a.Number;
      r.dBmagnitude.should.be.a.Number;
      r.phase.should.be.a.Number;

      r.magnitude.should.not.equal(0);
      r.dBmagnitude.should.not.equal(0);
      r.phase.should.not.equal(0);
    });

    it('reinit does not crash', function () {
      filter.reinit();
    });

  });
});
