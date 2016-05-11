'use strict';

let assert = require('assert'),
    error = require('../../lib/helpers/error');

describe('error', function () {

  describe('config', function () {

    it('should return invalid value for field', function () {
      assert.equal(error.config.invalidValue('foobar'), "highlogger invalid value for 'foobar'");
    });

    it('should return invalid config', function () {
      assert.equal(error.config.invalid(), "highlogger invalid config");
    });

  });

  describe('transporter', function () {

    it('should message exceeded sizeLimit', function () {
      assert.equal(error.transporter.exceededSizeLimit(22), "message exceeded sizeLimit of 22");
    });

  });

  describe('general', function () {

    it('should return invalid value for field', function () {
      assert.equal(error.general.notInstanced(), "highlogger not instanced");
    });

    it('should return invalid config', function () {
      assert.equal(error.general.notImplemented('foobar'), "highlogger function 'foobar' not implemented");
    });

  });

});