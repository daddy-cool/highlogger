'use strict';

let HighLogger = require('../lib/highLogger'),
    assert = require('assert');

const SHARED_CONSTANTS = require('../lib/shared-constants');

describe('HighLogger', function () {

  describe('init', function () {
    describe('errorHandler', function () {
      it('should set a default errorHandler', function () {
        let highLogger = new HighLogger();
        assert.ok(typeof highLogger.errorHandler === 'function');
      });

      it('should set a custom errorHandler', function () {
        let customErrorhandler = function customErrorHandler() {},
          highLogger = new HighLogger({errorHandler: customErrorhandler});

        assert.equal(highLogger.errorHandler, customErrorhandler);
      });

      it('should not set a non-function errorHandler', function () {
        let highLogger = new HighLogger({errorHandler: 'foobar'});
        assert.ok(typeof highLogger.errorHandler === 'function');
      });
    });
  });

  it('should expose the relevant shared constants', function () {
    assert.equal(HighLogger.FACILITY, SHARED_CONSTANTS.FACILITY);
    assert.equal(HighLogger.SEVERITY, SHARED_CONSTANTS.SEVERITY);
    assert.equal(HighLogger.TRANSPORTER, SHARED_CONSTANTS.TRANSPORTER);
  });

});