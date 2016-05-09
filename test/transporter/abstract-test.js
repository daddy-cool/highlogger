'use strict';

let AbstractTransporter = require('../../lib/transporters/abstract'),
    assert = require('assert'),
    defaultAbstract = new AbstractTransporter({}),
    constants = require('../../lib/helpers/constants');

describe('transporter abstract', function () {

  describe('constructor', function () {

    describe('severity', function () {

      it('should set default severity', function () {
        assert.equal(defaultAbstract.severity.minimum, constants.SEVERITY.emerg);
        assert.equal(defaultAbstract.severity.maximum, constants.SEVERITY.debug);
      });

      it('should set custom severity', function () {
        let abstract0 = new AbstractTransporter({severityMin: 'crit'}),
            abstract1 = new AbstractTransporter({severityMax: 'crit'}),
            abstract2 = new AbstractTransporter({severityMin: 'crit', severityMax: 'info'});

        assert.equal(abstract0.severity.minimum, constants.SEVERITY.crit);
        assert.equal(abstract0.severity.maximum, constants.SEVERITY.debug);

        assert.equal(abstract1.severity.minimum, constants.SEVERITY.emerg);
        assert.equal(abstract1.severity.maximum, constants.SEVERITY.crit);

        assert.equal(abstract2.severity.minimum, constants.SEVERITY.crit);
        assert.equal(abstract2.severity.maximum, constants.SEVERITY.info);
      });

      it('should throw on invalid severity', function () {
        assert.throws(function () {
          new AbstractTransporter({severityMin: 'foo'});
        });
        assert.throws(function () {
          new AbstractTransporter({severityMax: 'bar'});
        });
      });

    });

    describe('sizeLimit', function () {

      it('should set default sizeLimit', function () {
        assert.equal(defaultAbstract.sizeLimit, Infinity);
      });

      it('should set custom sizeLimit', function () {
        let abstract = new AbstractTransporter({sizeLimit: 1});
        assert.equal(abstract.sizeLimit, 1);
      });

      it('should throw on invalid sizeLimit', function () {
        assert.throws(function () {
          new AbstractTransporter({sizeLimit: 'foo'});
        });
      });

    });

    describe('fallback', function () {

      it('should set no default fallback', function () {
        assert.equal(defaultAbstract.fallbackTransporter, null);
      });

      it('should set custom fallback', function () {
        let abstract = new AbstractTransporter({fallbackTransporter: new AbstractTransporter({})});
        assert.ok(abstract.fallbackTransporter instanceof AbstractTransporter);
      });

      it('should throw on invalid fallback', function () {
        assert.throws(function () {
          new AbstractTransporter({fallbackTransporter: "foo"});
        });
      });

    });

  });

  describe('log', function () {

    it('should call write as default', function (done) {
      let abstract = new AbstractTransporter({});

      abstract.write = function (message, severity, callback) {
        callback();
      };

      abstract.log('foo', 0, 'bar', done);
    });

    it('should call fallback on exceeded sizeLimit', function (done) {
      let abstract = new AbstractTransporter({sizeLimit: 1});

      abstract.fallback = function (message, severity, callback) {
        callback();
      };

      abstract.log('foo', 0, 'bar', done);
    });

  });

  describe('fallback', function () {

    it('should call write and fallback', function (done) {
      let fallbackTransporter = new AbstractTransporter({}),
          abstractTransporter = new AbstractTransporter({sizeLimit: 1, fallbackTransporter: fallbackTransporter});

      fallbackTransporter.write = function (message, severity, callback) {
        assert.equal(message, 'bar foo');
        callback();
      };
      abstractTransporter.write = function (message, severity, callback) {
        assert.equal(message, 'bar message exceeded sizeLimit of 1');
        callback();
      };
      abstractTransporter.log('foo', 0, 'bar', done);
    });

    it('should call write and fallback & JSON', function (done) {
      let fallbackTransporter = new AbstractTransporter({}),
          abstractTransporter = new AbstractTransporter({sizeLimit: 1, fallbackTransporter: fallbackTransporter, json: true});

      fallbackTransporter.write = function (message, severity, callback) {
        assert.equal(message, 'bar foo');
        callback();
      };
      abstractTransporter.write = function (message, severity, callback) {
        assert.deepEqual(JSON.parse(message), {message: 'message exceeded sizeLimit of 1', context: 'bar'});
        callback();
      };
      abstractTransporter.log('foo', 0, 'bar', done);
    });

    it('should call write and fallback with fallbackMessage', function (done) {
      let fallbackTransporter = new AbstractTransporter({}),
          abstractTransporter = new AbstractTransporter({sizeLimit: 1, fallbackTransporter: fallbackTransporter});

      fallbackTransporter.write = function (message, severity, callback) {
        assert.equal(message, 'bar foo');
        callback(null, "foobar");
      };
      abstractTransporter.write = function (message, severity, callback) {
        assert.equal(message, 'bar message exceeded sizeLimit of 1, foobar');
        callback();
      };
      abstractTransporter.log('foo', 0, 'bar', done);
    });

    it('should call write and fallback with fallbackMessage & JSON', function (done) {
      let fallbackTransporter = new AbstractTransporter({}),
          abstractTransporter = new AbstractTransporter({sizeLimit: 1, fallbackTransporter: fallbackTransporter, json: true});

      fallbackTransporter.write = function (message, severity, callback) {
        assert.equal(message, 'bar foo');
        callback(null, "foobar");
      };
      abstractTransporter.write = function (message, severity, callback) {
        assert.deepEqual(JSON.parse(message), {message: 'message exceeded sizeLimit of 1', context: 'bar', fallback: 'foobar'});
        callback();
      };
      abstractTransporter.log('foo', 0, 'bar', done);
    });

  });

  it('should throw on write', function () {
    assert.throws(defaultAbstract.write);
  });

});