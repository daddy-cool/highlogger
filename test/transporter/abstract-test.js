'use strict';

let Abstract = require('../../lib/transporters/abstract'),
    assert = require('assert'),
    defaultAbstract = new Abstract({}),
    constants = require('../../lib/helpers/constants');

describe('transporter abstract', function () {

  describe('constructor', function () {

    describe('severity', function () {

      it('should set default severity', function () {
        assert.equal(defaultAbstract.severity.minimum, constants.SEVERITY.emerg);
        assert.equal(defaultAbstract.severity.maximum, constants.SEVERITY.debug);
      });

      it('should set custom severity', function () {
        let abstract0 = new Abstract({severityMin: 'crit'}),
            abstract1 = new Abstract({severityMax: 'crit'}),
            abstract2 = new Abstract({severityMin: 'crit', severityMax: 'info'});

        assert.equal(abstract0.severity.minimum, constants.SEVERITY.crit);
        assert.equal(abstract0.severity.maximum, constants.SEVERITY.debug);

        assert.equal(abstract1.severity.minimum, constants.SEVERITY.emerg);
        assert.equal(abstract1.severity.maximum, constants.SEVERITY.crit);

        assert.equal(abstract2.severity.minimum, constants.SEVERITY.crit);
        assert.equal(abstract2.severity.maximum, constants.SEVERITY.info);
      });

      it('should throw on invalid severity', function () {
        assert.throws(function () {
          new Abstract({severityMin: 'foo'});
        }, null, null);
        assert.throws(function () {
          new Abstract({severityMax: 'bar'});
        }, null, null);
      });

    });

    describe('json', function () {

      it('should set default json', function () {
        assert.equal(defaultAbstract.json, false);
      });

      it('should set custom json', function () {
        let abstract = new Abstract({json: true});
        assert.equal(abstract.json, true);
      });

      it('should throw on invalid json', function () {
        assert.throws(function () {
          new Abstract({json: 'foo'});
        }, null, null);
      });

    });

    describe('useContext', function () {

      it('should set default useContext', function () {
        assert.equal(defaultAbstract.useContext, false);
      });

      it('should set custom useContext', function () {
        let abstract = new Abstract({useContext: true});
        assert.equal(abstract.useContext, true);
      });

      it('should throw on invalid useContext', function () {
        assert.throws(function () {
          new Abstract({useContext: 'foo'});
        }, null, null);
      });

    });

    describe('sizeLimit', function () {

      it('should set default sizeLimit', function () {
        assert.equal(defaultAbstract.sizeLimit, Infinity);
      });

      it('should set custom sizeLimit', function () {
        let abstract = new Abstract({sizeLimit: 1});
        assert.equal(abstract.sizeLimit, 1);
      });

      it('should throw on invalid sizeLimit', function () {
        assert.throws(function () {
          new Abstract({sizeLimit: 'foo'});
        }, null, null);
      });

    });

    describe('fallback', function () {

      it('should set no default fallback', function () {
        assert.equal(defaultAbstract.fallbackTransporter, null);
      });

      it('should set custom fallback', function () {
        let abstract = new Abstract({fallbackTransporter: new Abstract({})});
        assert.ok(abstract.fallbackTransporter instanceof Abstract);
      });

      it('should throw on invalid fallback', function () {
        assert.throws(function () {
          new Abstract({fallbackTransporter: "foo"});
        }, null, null);
      });

    });

  });

  describe('log', function () {

    it('should call write as default', function (done) {
      let abstract = new Abstract({});

      abstract.write = function (message, context, severity, callback) {
        callback();
      };

      abstract.log('foo', 0, 'bar', done);
    });

    it('should call fallback on exceeded sizeLimit', function (done) {
      let abstract = new Abstract({sizeLimit: 1});

      abstract.fallback = function (severity, context, callback) {
        callback();
      };

      abstract.log('foo', 0, 'bar', done);
    });

  });

  describe('fallback', function () {

    it('should call write and fallback', function (done) {
      let fallbackTransporter = new Abstract({}),
          abstractTransporter = new Abstract({sizeLimit: 1, fallbackTransporter: fallbackTransporter, useContext: true});

      fallbackTransporter.write = function (message, context, severity, callback) {
        assert.equal(message, 'foo');
        callback();
      };
      abstractTransporter.write = function (message, context, severity, callback) {
        assert.equal(message, 'bar message exceeded sizeLimit');
        callback();
      };
      abstractTransporter.log('foo', 0, 'bar', done);
    });

    it('should call write and fallback & JSON', function (done) {
      let fallbackTransporter = new Abstract({useContext: true}),
          abstractTransporter = new Abstract({sizeLimit: 1, fallbackTransporter: fallbackTransporter, json: true, useContext: true});

      fallbackTransporter.write = function (message, context, severity, callback) {
        assert.equal(message, 'bar foo');
        callback();
      };
      abstractTransporter.write = function (message, context, severity, callback) {
        assert.deepEqual(JSON.parse(message), {message: 'message exceeded sizeLimit', context: 'bar'});
        callback();
      };
      abstractTransporter.log('foo', 0, 'bar', done);
    });

    it('should call write and fallback with fallbackMessage', function (done) {
      let fallbackTransporter = new Abstract({useContext: true}),
          abstractTransporter = new Abstract({sizeLimit: 1, fallbackTransporter: fallbackTransporter, useContext: true});

      fallbackTransporter.write = function (message, context, severity, callback) {
        assert.equal(message, 'bar foo');
        callback(null, "foobar");
      };
      abstractTransporter.write = function (message, context, severity, callback) {
        assert.equal(message, 'bar message exceeded sizeLimit, foobar');
        callback();
      };
      abstractTransporter.log('foo', 0, 'bar', done);
    });

    it('should call write and fallback with fallbackMessage & JSON', function (done) {
      let fallbackTransporter = new Abstract({}),
          abstractTransporter = new Abstract({sizeLimit: 1, fallbackTransporter: fallbackTransporter, json: true});

      fallbackTransporter.write = function (message, context, severity, callback) {
        assert.equal(message, 'foo');
        callback(null, "foobar");
      };
      abstractTransporter.write = function (message, context, severity, callback) {
        assert.deepEqual(JSON.parse(message), {message: 'message exceeded sizeLimit', fallback: 'foobar'});
        callback();
      };
      abstractTransporter.log('foo', 0, 'bar', done);
    });

  });

  it('should throw on write', function () {
    assert.throws(defaultAbstract.write, null, null);
  });

});