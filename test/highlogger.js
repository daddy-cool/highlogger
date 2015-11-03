'use strict';

let Highlogger = require('../lib/highlogger'),
    ConsoleTransporter = require('../lib/transporter/console'),
    SocketTransporter = require('../lib/transporter/socket'),
    SyslogTransporter = require('../lib/transporter/syslog'),
    assert = require('assert'),
    async = require('async'),
    dgram = require('dgram');

const SHARED_CONSTANTS = require('../lib/shared-constants');

describe('Highlogger', function () {

  describe('getInstance', function () {
    it('should throw an error if used before instancing', function () {
      delete require.cache;
      assert.throws(Highlogger.getInstance, "should throw error");
    });

    it('should return an instance if instanced at least once', function () {
      delete require.cache;
      new Highlogger();
      assert.ok(Highlogger.getInstance() instanceof Highlogger);
    });

    it('should return the last instance', function () {
      delete require.cache;
      let hl1 = new Highlogger(),
          hl2;

      assert.equal(Highlogger.getInstance(), hl1);
      hl2 = new Highlogger();

      assert.notEqual(Highlogger.getInstance(), hl1);
      assert.equal(Highlogger.getInstance(), hl2);
    });
  });

  describe('init', function () {
    describe('errorHandler', function () {
      it('should set a default errorHandler', function () {
        let highLogger = new Highlogger();
        assert.ok(typeof highLogger.errorHandler === 'function');
      });

      it('should set a custom errorHandler', function () {
        let customErrorHandler = function () {},
            highLogger = new Highlogger({errorHandler: customErrorHandler});

        assert.equal(highLogger.errorHandler, customErrorHandler);
      });

      it('should not set a non-function errorHandler', function () {
        let highLogger = new Highlogger({errorHandler: 'foobar'});
        assert.ok(typeof highLogger.errorHandler === 'function');
      });

      it('should by default throw an error on misuse', function () {
        assert.throws(function () {
          new Highlogger({
            transporters: [{type: -1}]
          });
        }, 'should throw');
      });

      it('should by default convert an error message into an error', function () {
        let hl = new Highlogger();
        assert.throws(function () {
          hl.errorHandler('foobar');
        }, 'this should throw');
      });
    });

    describe('transporter', function () {
      it('should set a default transporter', function () {
        let highLogger = new Highlogger();
        assert.equal(highLogger.transporters.length, 1);
        assert.ok(highLogger.transporters[0] instanceof ConsoleTransporter);
      });

      it('should set a custom transporters', function () {
        let highLogger = new Highlogger({
          transporters: [{type: Highlogger.TRANSPORTER.CONSOLE}, {type: Highlogger.TRANSPORTER.SYSLOG}]
        });

        assert.equal(highLogger.transporters.length, 2);
        assert.ok(highLogger.transporters[0] instanceof ConsoleTransporter);
        assert.ok(highLogger.transporters[1] instanceof SyslogTransporter);
      });

      it('should skip invalid transporter config', function () {
        let highLogger = new Highlogger({
              transporters: [1, 2]
            }),
            highLogger2 = new Highlogger({
              transporters: [1, 2, {type: Highlogger.TRANSPORTER.CONSOLE}]
            });

        assert.equal(highLogger.transporters.length, 0);
        assert.equal(highLogger2.transporters.length, 1);
      });

      it('should call errorHandler on unsupported transporterType', function (done) {
        let errorHandler = function (err) {
          assert.equal(err.message, 'unsupported transporter');
          done();
        };

        new Highlogger({
          errorHandler: errorHandler,
          transporters: [{type: -1}]
        });
      });
    });

    describe('debugKeys', function () {
      it('should set default debugKeys', function () {
        let highLogger = new Highlogger();
        assert.deepEqual(highLogger.debugKeys.include, []);
        assert.deepEqual(highLogger.debugKeys.exclude, []);
      });

      it('should not set invalid debugKeys', function () {
        let highLogger = new Highlogger({debugKeys: 1}),
            highLogger2 = new Highlogger({debugKeys: {include: 1, exclude: 2}}),
            highLogger3 = new Highlogger({debugKeys: {include: ['a', 1, 'c'], exclude: ['b', 2, 'd']}}),
            highLogger4 = new Highlogger({debugKeys: {include: ['*'], exclude: null}});

        assert.deepEqual(highLogger.debugKeys.include, []);
        assert.deepEqual(highLogger.debugKeys.exclude, []);
        assert.deepEqual(highLogger2.debugKeys.include, []);
        assert.deepEqual(highLogger2.debugKeys.exclude, []);
        assert.deepEqual(highLogger3.debugKeys.include, [new RegExp('^a$'), new RegExp('^c$')]);
        assert.deepEqual(highLogger3.debugKeys.exclude, [new RegExp('^b$'), new RegExp('^d$')]);
        assert.deepEqual(highLogger4.debugKeys.include, [/^.*?$/]);
        assert.deepEqual(highLogger4.debugKeys.exclude, []);
      });
    });
  });

  describe('log', function () {
    describe('severity types', function () {
      let facility = 10,
          port,
          port2,
          socket,
          socket2,
          message = 'foobar',
          messageId = 'foobar2',
          tests = [
            ['emergency', Highlogger.SEVERITY.EMERG],
            ['alert', Highlogger.SEVERITY.ALERT],
            ['critical', Highlogger.SEVERITY.CRIT],
            ['error', Highlogger.SEVERITY.ERROR],
            ['warning', Highlogger.SEVERITY.WARN],
            ['notice', Highlogger.SEVERITY.NOTICE],
            ['info', Highlogger.SEVERITY.INFO]
          ];

      beforeEach(function (done) {
        async.parallel([
          function (cb) {
            socket = dgram.createSocket('udp4');

            socket.on("error", function (err) {
              assert.ifError(err);
            });

            socket.bind(null, function () {
              port = socket.address().port;
              cb();
            });
          },
          function (cb) {
            socket2 = dgram.createSocket('udp4');

            socket2.on("error", function (err) {
              assert.ifError(err);
            });

            socket2.bind(null, function () {
              port2 = socket2.address().port;
              cb();
            });
          }
        ], done);
      });

      afterEach(function (done) {
        async.parallel([
          function (cb) {
            socket.close(cb);
          },
          function (cb) {
            socket2.close(cb);
          }
        ], done);
      });

      tests.forEach(function (test) {
        it('should log ' + test[0] + ' and pass options to all transporters', function (done) {
          let highLogger = new Highlogger({
                transporters: [
                  {type: Highlogger.TRANSPORTER.SYSLOG, port: port, facility: facility},
                  {type: Highlogger.TRANSPORTER.SYSLOG, port: port2, facility: facility}
                ]
              }),
              doneCount = 0;

          function doneWait () {
            doneCount++;
            if (doneCount === 2) {
              return done();
            }
          }

          socket.on("message", function (msg) {
            let messageSplitArray = msg.toString().split(' ');
            assert.equal(messageSplitArray[0], '<' + (facility*8+test[1]) + '>1');
            assert.equal(messageSplitArray[5], messageId+test[0]);
            assert.equal(messageSplitArray[7], message+test[0]);
            doneWait();
          });

          socket2.on("message", function (msg) {
            let messageSplitArray = msg.toString().split(' ');
            assert.equal(messageSplitArray[0], '<' + (facility*8+test[1]) + '>1');
            assert.equal(messageSplitArray[5], messageId+test[0]);
            assert.equal(messageSplitArray[7], message+test[0]);
            doneWait();
          });

          highLogger[test[0]](message+test[0], {messageId: messageId+test[0]});
        });
      });

      it('should only log on transporters with matching severity range', function (done) {
        let highLogger = new Highlogger({
              transporters: [
                  {
                    type: Highlogger.TRANSPORTER.SOCKET,
                    port: port,
                    severity: {
                      minimum: Highlogger.SEVERITY.EMERG,
                      maximum: Highlogger.SEVERITY.EMERG
                    },
                    address: '127.0.0.1',
                    method: 'udp4'
                  },
                  {
                    type: Highlogger.TRANSPORTER.SOCKET,
                    port: port2,
                    severity: {
                      minimum: Highlogger.SEVERITY.INFO,
                      maximum: Highlogger.SEVERITY.INFO
                    },
                    address: '127.0.0.1',
                    method: 'udp4'
                  }
              ]
            }),
            doneCount = 0;

        function doneWait () {
          doneCount++;
          if (doneCount === 2) {
            return done();
          }
        }

        socket.on("message", function (msg) {
          assert.equal(msg.toString(), message+'emerg');
          doneWait();
        });

        socket2.on("message", function (msg) {
          assert.equal(msg.toString(), message+'info');
          doneWait();
        });

        highLogger.emergency(message+'emerg');
        highLogger.info(message+'info');
      });
    });

    describe('json', function () {
      let port,
          socket;

      beforeEach(function (done) {
        socket = dgram.createSocket('udp4');

        socket.on("error", function (err) {
          assert.ifError(err);
        });

        socket.bind(null, function () {
          port = socket.address().port;
          done();
        });
      });

      afterEach(function (done) {
        socket.close(done);
      });

      it('should wrap message inside curly braces', function (done) {
        let highLogger = new Highlogger({
              transporters: [{type: Highlogger.TRANSPORTER.SYSLOG, port: port, json: true}]
            }),
            message = 'foobar';

        socket.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[7], '{"message":"' + message + '"}');
          done();
        });

        highLogger.info(message);
      });

      it('should not wrap message inside curly braces', function (done) {
        let highLogger = new Highlogger({
              transporters: [{type: Highlogger.TRANSPORTER.SYSLOG, port: port, json: false}]
            }),
            message = 'foobar';

        socket.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[7], message);
          done();
        });

        highLogger.info(message);
      });

      it('should not wrap stringified objects inside curly braces', function (done) {
        let highLogger = new Highlogger({
              transporters: [{type: Highlogger.TRANSPORTER.SYSLOG, port: port, json: true}]
            }),
            message = {foobar: 'foobar'};

        socket.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[7], JSON.stringify(message));
          done();
        });

        highLogger.info(message);
      });
    });

    describe('getDebug', function () {

      it('should return notIncludedDebug if debugKey is not included', function () {
        let highLogger = new Highlogger(),
            highLogger2 = new Highlogger({debugKeys: {include: ['bar']}});

        assert.equal(highLogger.getDebug().name, 'notIncludedDebug');
        assert.equal(highLogger2.getDebug('foo').name, 'notIncludedDebug');
      });

      it('should return excludedDebug if debugKey is excluded', function () {
        let highLogger = new Highlogger({debugKeys: {include: ['*'], exclude: ['foo*']}});

        assert.equal(highLogger.getDebug('foo').name, 'excludedDebug');
      });

      it('should return debug if debugKey is included and not excluded', function () {
        let highLogger = new Highlogger({debugKeys: {include: ['*bar*'], exclude: ['*foo*']}});

        assert.equal(highLogger.getDebug('ffffbar').name, 'debug');
        assert.equal(highLogger.getDebug('barfoobar').name, 'excludedDebug');
      });

      it('should set debugKey and set severity to debug', function (done) {
        let socket = dgram.createSocket('udp4'),
            debugKey = 'foobar',
            facility = 10;

        socket.on("error", function (err) {
          assert.ifError(err);
        });

        socket.bind(null, function () {
          let highLogger =  new Highlogger({
                debugKeys: {include: ['*']},
                transporters: [{type: Highlogger.TRANSPORTER.SYSLOG, port: socket.address().port, facility: facility}]
              }),
              debug = highLogger.getDebug(debugKey);

          debug('message');
        });

        socket.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[5], debugKey);
          assert.equal(messageSplitArray[0], '<' + (facility*8+SHARED_CONSTANTS.SEVERITY.DEBUG) + '>1');
          socket.close(done);
        });
      });

      it('should not overwrite passed debugKey', function (done) {
        let socket = dgram.createSocket('udp4'),
            notDebugKey = 'notFoobar';

        socket.on("error", function (err) {
          assert.ifError(err);
        });

        socket.bind(null, function () {
          let highLogger =  new Highlogger({
                debugKeys: {include: ['*']},
                transporters: [{type: Highlogger.TRANSPORTER.SYSLOG, port: socket.address().port}]
              }),
              debug = highLogger.getDebug('foobar');

          debug('message', {debugKey: notDebugKey});
        });

        socket.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[5], notDebugKey);
          socket.close(done);
        });
      });

    });
  });

  it('should expose the relevant shared constants', function () {
    assert.equal(Highlogger.FACILITY, SHARED_CONSTANTS.FACILITY);
    assert.equal(Highlogger.SEVERITY, SHARED_CONSTANTS.SEVERITY);
    assert.equal(Highlogger.TRANSPORTER, SHARED_CONSTANTS.TRANSPORTER);
  });

});