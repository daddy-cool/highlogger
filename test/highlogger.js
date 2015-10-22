'use strict';

let HighLogger = require('../lib/highlogger'),
    ConsoleTransporter = require('../lib/transporter/console'),
    SocketTransporter = require('../lib/transporter/socket'),
    SyslogTransporter = require('../lib/transporter/syslog'),
    assert = require('assert'),
    async = require('async'),
    dgram = require('dgram');

const SHARED_CONSTANTS = require('../lib/shared-constants');

describe('HighLogger', function () {

  describe('init', function () {
    describe('errorHandler', function () {
      it('should set a default errorHandler', function () {
        let highLogger = new HighLogger();
        assert.ok(typeof highLogger.errorHandler === 'function');
      });

      it('should set a custom errorHandler', function () {
        let customErrorHandler = function () {},
            highLogger = new HighLogger({errorHandler: customErrorHandler});

        assert.equal(highLogger.errorHandler, customErrorHandler);
      });

      it('should not set a non-function errorHandler', function () {
        let highLogger = new HighLogger({errorHandler: 'foobar'});
        assert.ok(typeof highLogger.errorHandler === 'function');
      });

      it('should by default log to console.error on error', function (done) {
        let consoleModule = require('console'),
            consoleModuleError = consoleModule.error;

        consoleModule.error = function (err) {
          assert.ok(err instanceof Error);
          consoleModule.error = consoleModuleError;
          done();
        };

        new HighLogger({
          transporters: [{type: -1}]
        });
      });
    });

    describe('transporter', function () {
      it('should set a default transporter', function () {
        let highLogger = new HighLogger();
        assert.equal(highLogger.transporters.length, 1);
        assert.ok(highLogger.transporters[0] instanceof ConsoleTransporter);
      });

      it('should set a custom transporters', function () {
        let highLogger = new HighLogger({
          transporters: [{type: HighLogger.TRANSPORTER.SOCKET}, {type: HighLogger.TRANSPORTER.SYSLOG}]
        });

        assert.equal(highLogger.transporters.length, 2);
        assert.ok(highLogger.transporters[0] instanceof SocketTransporter);
        assert.ok(highLogger.transporters[1] instanceof SyslogTransporter);
      });

      it('should skip invalid transporter config', function () {
        let highLogger = new HighLogger({
              transporters: [1, 2]
            }),
            highLogger2 = new HighLogger({
              transporters: [1, 2, {type: HighLogger.TRANSPORTER.CONSOLE}]
            });

        assert.equal(highLogger.transporters.length, 0);
        assert.equal(highLogger2.transporters.length, 1);
      });

      it('should call errorHandler on unsupported transporterType', function (done) {
        let errorHandler = function (err) {
          assert.equal(err.message, 'unsupported transporter');
          done();
        };

        new HighLogger({
          errorHandler: errorHandler,
          transporters: [{type: -1}]
        });
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
            ['emergency', HighLogger.SEVERITY.EMERG],
            ['alert', HighLogger.SEVERITY.ALERT],
            ['critical', HighLogger.SEVERITY.CRIT],
            ['error', HighLogger.SEVERITY.ERROR],
            ['warning', HighLogger.SEVERITY.WARN],
            ['notice', HighLogger.SEVERITY.NOTICE],
            ['info', HighLogger.SEVERITY.INFO]
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
          let highLogger = new HighLogger({
                transporters: [
                  {type: HighLogger.TRANSPORTER.SYSLOG, port: port, facility: facility},
                  {type: HighLogger.TRANSPORTER.SYSLOG, port: port2, facility: facility}
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
        let highLogger = new HighLogger({
              transporters: [
                  {type: HighLogger.TRANSPORTER.SYSLOG, port: port, severity: {
                    minimum: HighLogger.SEVERITY.EMERG, maximum: HighLogger.SEVERITY.EMERG
                  }},
                  {type: HighLogger.TRANSPORTER.SYSLOG, port: port2, severity: {
                    minimum: HighLogger.SEVERITY.INFO, maximum: HighLogger.SEVERITY.INFO
                  }}
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
          assert.equal(messageSplitArray[0], '<' + (HighLogger.FACILITY.USER*8) + '>1');
          assert.equal(messageSplitArray[7], message+'emerg');
          doneWait();
        });

        socket2.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[0], '<' + (HighLogger.FACILITY.USER*8+6) + '>1');
          assert.equal(messageSplitArray[7], message+'info');
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
        let highLogger = new HighLogger({
              transporters: [{type: HighLogger.TRANSPORTER.SYSLOG, port: port, json: true}]
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
        let highLogger = new HighLogger({
              transporters: [{type: HighLogger.TRANSPORTER.SYSLOG, port: port, json: false}]
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
        let highLogger = new HighLogger({
              transporters: [{type: HighLogger.TRANSPORTER.SYSLOG, port: port, json: true}]
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

      it('should return debug function with default empty debugKey', function () {
        let highLogger = new HighLogger({debugKeys: {include: ['*']}}),
            debug = highLogger.getDebug('f');

        assert.equal(debug.name, 'debug');
      });

      it('debug', function () {
        let highLogger = new HighLogger({debugKeys: {include: ['*'], exclude: ['foo*']}}),
            debug = highLogger.getDebug('f');

        debug('foobar');
      });

    });
  });

  it('should expose the relevant shared constants', function () {
    assert.equal(HighLogger.FACILITY, SHARED_CONSTANTS.FACILITY);
    assert.equal(HighLogger.SEVERITY, SHARED_CONSTANTS.SEVERITY);
    assert.equal(HighLogger.TRANSPORTER, SHARED_CONSTANTS.TRANSPORTER);
  });

});