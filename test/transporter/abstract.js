'use strict';

let AbstractTransporter = require('../../lib/transporter/abstract'),
    assert = require('assert');

const SHARED_CONSTANTS = require('../../lib/shared-constants');

function errorHandler (err) {
  assert.ifError(err);
}

describe('transporter abstract', function () {
  describe('set severity', function () {
    it('should set default severity', function () {
      let abstractTransporter = new AbstractTransporter({errorHandler: errorHandler});

      assert.equal(abstractTransporter.severity.minimum, SHARED_CONSTANTS.SEVERITY.EMERG);
      assert.equal(abstractTransporter.severity.maximum, SHARED_CONSTANTS.SEVERITY.DEBUG);
    });

    it('should set custom severity', function () {
      let severity = {
            minimum: SHARED_CONSTANTS.SEVERITY.CRIT,
            maximum: SHARED_CONSTANTS.SEVERITY.INFO
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