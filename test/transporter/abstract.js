'use strict';

let HighLogger = require('../../highlogger'),
    AbstractTransporter = require('../../lib/transporter/abstract'),
    assert = require('assert');

function errorHandler (err) {
  assert.ifError(err);
}

describe('transporter abstract', function () {
  describe('set severity', function () {
    it('should set default severity', function () {
      let abstractTransporter = new AbstractTransporter({errorHandler: errorHandler});

      assert.equal(abstractTransporter.severity.minimum, HighLogger.SEVERITY.EMERG);
      assert.equal(abstractTransporter.severity.maximum, HighLogger.SEVERITY.DEBUG);
    });

    it('should set custom severity', function () {
      let severity = {
            minimum: HighLogger.SEVERITY.CRIT,
            maximum: HighLogger.SEVERITY.INFO
          },
          abstractTransporter = new AbstractTransporter({
            errorHandler: errorHandler,
            severity: severity
          });

      assert.equal(abstractTransporter.severity.minimum, severity.minimum);
      assert.equal(abstractTransporter.severity.maximum, severity.maximum);
    });

    it('should not set non-numerical severity', function () {
      let severity = {
            minimum: 'foo',
            maximum: 'bar'
          },
          abstractTransporter = new AbstractTransporter({
            errorHandler: errorHandler,
            severity: severity
          });

      assert.notEqual(abstractTransporter.severity.minimum, severity.minimum);
      assert.notEqual(abstractTransporter.severity.maximum, severity.maximum);
    });
  });

  describe('write', function () {
    it('should not write', function (done) {
      let abstractTransporter = new AbstractTransporter({errorHandler: errorHandler});

      abstractTransporter.write(null, null, function (err) {
        assert.equal(err.message, 'AbstractTransporter.write method was not overwritten');
        done();
      });
    });
  });
});