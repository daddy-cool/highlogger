'use strict';

let AbstractTransporter = require('../../lib/transporters/abstract'),
    assert = require('assert');

const SHARED_CONSTANTS = require('../../lib/helpers/constants');

describe('transporter abstract', function () {
  describe('set severity', function () {
    it('should set default severity', function () {
      let abstractTransporter = new AbstractTransporter({});

      assert.equal(abstractTransporter.severity.minimum, SHARED_CONSTANTS.SEVERITY.emerg);
      assert.equal(abstractTransporter.severity.maximum, SHARED_CONSTANTS.SEVERITY.debug);
    });

    it('should set custom severity', function () {
      let abstractTransporter = new AbstractTransporter({
            severityMin: 'crit',
            severityMax: 'info'
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
            severity: severity
          });

      assert.equal(abstractTransporter.severity.minimum, SHARED_CONSTANTS.SEVERITY.emerg);
      assert.equal(abstractTransporter.severity.maximum, SHARED_CONSTANTS.SEVERITY.debug);
    });
  });

  describe('write', function () {
    it('should not write', function () {
      let abstractTransporter = new AbstractTransporter({});

      assert.throws(abstractTransporter.write);
    });
  });
});