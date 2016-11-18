/* global it, describe, before, after */

'use strict'

/* eslint-disable no-unused-vars */
var should = require('should')
/* eslint-enable no-unused-vars */
var FirCoeffs = require('../src/firCoeffs')
var FirFilter = require('../src/firFilter')

describe('iir.js', function () {
  var firCalculator

  before(function () {
    firCalculator = new FirCoeffs()
  })

  after(function () {})

  describe('fir-lp', function () {
    var filterCoeffs, filter
    it('can calculate coeffs', function () {
      filterCoeffs = firCalculator.lowpass({
        order: 100,
        Fs: 4000,
        Fc: 500
      })
      filterCoeffs.should.be.an.Array
      filterCoeffs[44].should.be.a.Number
      filterCoeffs.length.should.equal(101)
    })

    it('can generate a filter', function () {
      filter = new FirFilter(filterCoeffs)
      filter.should.be.an.Object
    })

    it('can do a single step', function () {
      var out = filter.singleStep(10)
      out.should.be.a.Number
      out.should.not.equal(0)
    })

    it('can do multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.multiStep(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    it('can simulate multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.simulate(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    it('calculates filter response', function () {
      var r = filter.response(200)
      r.should.be.an.Array
      r.length.should.equal(200)
      r[20].should.be.an.Object
      r[20].magnitude.should.be.a.Number
      r[20].dBmagnitude.should.be.a.Number
      r[20].phase.should.be.a.Number
      r[20].unwrappedPhase.should.be.a.Number
      r[20].phaseDelay.should.be.a.Number
      r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0)
      r[20].dBmagnitude.should.not.equal(0)
      r[20].phase.should.not.equal(0)
      r[20].unwrappedPhase.should.not.equal(0)
      r[20].phaseDelay.should.not.equal(0)
      r[20].groupDelay.should.not.equal(0)
    })

    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  describe('fir-hp', function () {
    var filterCoeffs, filter
    it('can calculate coeffs', function () {
      filterCoeffs = firCalculator.highpass({
        order: 100,
        Fs: 4000,
        Fc: 1457
      })
      filterCoeffs.should.be.an.Array
      filterCoeffs[44].should.be.a.Number
      filterCoeffs.length.should.equal(101)
    })

    it('can generate a filter', function () {
      filter = new FirFilter(filterCoeffs)
      filter.should.be.an.Object
    })

    it('can do a single step', function () {
      var out = filter.singleStep(10)
      out.should.be.a.Number
      out.should.not.equal(0)
    })

    it('can do multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.multiStep(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    it('can simulate multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.simulate(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    it('calculates filter response', function () {
      var r = filter.response(200)
      r.should.be.an.Array
      r.length.should.equal(200)
      r[20].should.be.an.Object
      r[20].magnitude.should.be.a.Number
      r[20].dBmagnitude.should.be.a.Number
      r[20].phase.should.be.a.Number
      r[20].unwrappedPhase.should.be.a.Number
      r[20].phaseDelay.should.be.a.Number
      r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0)
      r[20].dBmagnitude.should.not.equal(0)
      r[20].phase.should.not.equal(0)
      r[20].unwrappedPhase.should.not.equal(0)
      r[20].phaseDelay.should.not.equal(0)
      r[20].groupDelay.should.not.equal(0)
    })

    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  describe('fir-br', function () {
    var filterCoeffs, filter
    it('can calculate coeffs', function () {
      filterCoeffs = firCalculator.bandstop({
        order: 100,
        Fs: 4000,
        F1: 457,
        F2: 1457
      })
      filterCoeffs.should.be.an.Array
      filterCoeffs[44].should.be.a.Number
      filterCoeffs.length.should.equal(101)
    })

    it('can generate a filter', function () {
      filter = new FirFilter(filterCoeffs)
      filter.should.be.an.Object
    })

    it('can do a single step', function () {
      var out = filter.singleStep(10)
      out.should.be.a.Number
      out.should.not.equal(0)
    })

    it('can do multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.multiStep(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    it('can simulate multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.simulate(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    it('calculates filter response', function () {
      var r = filter.response(200)
      r.should.be.an.Array
      r.length.should.equal(200)
      r[20].should.be.an.Object
      r[20].magnitude.should.be.a.Number
      r[20].dBmagnitude.should.be.a.Number
      r[20].phase.should.be.a.Number
      r[20].unwrappedPhase.should.be.a.Number
      r[20].phaseDelay.should.be.a.Number
      r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0)
      r[20].dBmagnitude.should.not.equal(0)
      r[20].phase.should.not.equal(0)
      r[20].unwrappedPhase.should.not.equal(0)
      r[20].phaseDelay.should.not.equal(0)
      r[20].groupDelay.should.not.equal(0)
    })

    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  describe('fir-bp', function () {
    var filterCoeffs, filter
    it('can calculate coeffs', function () {
      filterCoeffs = firCalculator.bandpass({
        order: 100,
        Fs: 4000,
        F1: 577,
        F2: 1111
      })
      filterCoeffs.should.be.an.Array
      filterCoeffs[44].should.be.a.Number
      filterCoeffs.length.should.equal(101)
    })

    it('can generate a filter', function () {
      filter = new FirFilter(filterCoeffs)
      filter.should.be.an.Object
    })

    it('can do a single step', function () {
      var out = filter.singleStep(10)
      out.should.be.a.Number
      out.should.not.equal(0)
    })

    it('can do multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.multiStep(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    it('can simulate multiple steps', function () {
      var simInput = []
      for (var i = 0; i < 10000; i++) {
        simInput.push(i % 10 - 5)
      }
      var out = filter.simulate(simInput)
      out.should.be.an.Array
      out.length.should.equal(10000)
      out[111].should.not.equal(simInput[111])
    })

    it('calculates filter response', function () {
      var r = filter.response(200)
      r.should.be.an.Array
      r.length.should.equal(200)
      r[20].should.be.an.Object
      r[20].magnitude.should.be.a.Number
      r[20].dBmagnitude.should.be.a.Number
      r[20].phase.should.be.a.Number
      r[20].unwrappedPhase.should.be.a.Number
      r[20].phaseDelay.should.be.a.Number
      r[20].groupDelay.should.be.a.Number

      r[20].magnitude.should.not.equal(0)
      r[20].dBmagnitude.should.not.equal(0)
      r[20].phase.should.not.equal(0)
      r[20].unwrappedPhase.should.not.equal(0)
      r[20].phaseDelay.should.not.equal(0)
      r[20].groupDelay.should.not.equal(0)
    })

    describe('fir-kb-bp', function () {
      var filterCoeffs, filter
      it('can calculate coeffs', function () {
        filterCoeffs = firCalculator.kbFilter({
          order: 101,
          Fs: 4000,
          Fa: 577,
          Fb: 1111,
          Att: 100
        })
        filterCoeffs.should.be.an.Array
        filterCoeffs[44].should.be.a.Number
        filterCoeffs.length.should.equal(101)
      })

      it('can generate a filter', function () {
        filter = new FirFilter(filterCoeffs)
        filter.should.be.an.Object
      })

      it('can do a single step', function () {
        var out = filter.singleStep(10)
        out.should.be.a.Number
        out.should.not.equal(0)
      })

      it('can do multiple steps', function () {
        var simInput = []
        for (var i = 0; i < 10000; i++) {
          simInput.push(i % 10 - 5)
        }
        var out = filter.multiStep(simInput)
        out.should.be.an.Array
        out.length.should.equal(10000)
        out[111].should.not.equal(simInput[111])
      })

      it('can simulate multiple steps', function () {
        var simInput = []
        for (var i = 0; i < 10000; i++) {
          simInput.push(i % 10 - 5)
        }
        var out = filter.simulate(simInput)
        out.should.be.an.Array
        out.length.should.equal(10000)
        out[111].should.not.equal(simInput[111])
      })

      it('calculates filter response', function () {
        var r = filter.response(200)
        r.should.be.an.Array
        r.length.should.equal(200)
        r[20].should.be.an.Object
        r[20].magnitude.should.be.a.Number
        r[20].dBmagnitude.should.be.a.Number
        r[20].phase.should.be.a.Number
        r[20].unwrappedPhase.should.be.a.Number
        r[20].phaseDelay.should.be.a.Number
        r[20].groupDelay.should.be.a.Number

        r[20].magnitude.should.not.equal(0)
        r[20].dBmagnitude.should.not.equal(0)
        r[20].phase.should.not.equal(0)
        r[20].unwrappedPhase.should.not.equal(0)
        r[20].phaseDelay.should.not.equal(0)
        r[20].groupDelay.should.not.equal(0)
      })
    })

    it('reinit does not crash', function () {
      filter.reinit()
    })
  })

  describe('fir-helpers', function () {
    it('can get available filters', function () {
      var av = firCalculator.available()
      av.length.should.not.equal(0)
      av[1].should.be.a.String
    })
  })
})
