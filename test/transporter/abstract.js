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

      assert.equal(abstractTransporter.severity.minimum, SHARED_CONSTANTS.SEVERITY.emerg);
      assert.equal(abstractTransporter.severity.maximum, SHARED_CONSTANTS.SEVERITY.debug);
    });

    it('should set custom severity', function () {
      let severity = {
            minimum: 'crit',
            maximum: 'info'
          },
          abstractTransporter = new AbstractTransporter({
            errorHandler: errorHandler,
            severity: severity
          });

      assert.equal(abstractTransporter.severity.minimum, SHARED_CONSTANTS.SEVERITY.crit);
      assert.equal(abstractTransporter.severity.maximum, SHARED_CONSTANTS.SEVERITY.info);
    });

    it('should set default severity on invalid parameters', function () {
      let severity = {
            minimum: 'foo',
            maximum: 'bar'
          },
          abstractTransporter = new AbstractTransporter({
            errorHandler: errorHandler,
            severity: severity
          });

      assert.equal(abstractTransporter.severity.minimum, SHARED_CONSTANTS.SEVERITY.emerg);
      assert.equal(abstractTransporter.severity.maximum, SHARED_CONSTANTS.SEVERITY.debug);
    });
  });

  describe('write', function () {
    it('should not write', function (done) {
      let abstractTransporter = new AbstractTransporter({errorHandler: errorHandler});

      abstractTransporter.write(null, null, function (err) {
        assert.equal(err.message, 'write not implemented');
        done();
      });
    });
  });
});