'use strict';

let Highlogger = require('../lib/highlogger'),
    ConsoleTransporter = require('../lib/transporters/console'),
    SocketTransporter = require('../lib/transporters/socket'),
    SyslogTransporter = require('../lib/transporters/syslog'),
    assert = require('assert'),
    async = require('async'),
    dgram = require('dgram'),
    constants = require('../lib/helpers/constants');

process.env.SUPPRESS_NO_CONFIG_WARNING = true;

describe('Highlogger', function () {

  describe('getInstance', function () {
    it('should throw an error if used before instancing', function () {
      delete require.cache;
      assert.throws(Highlogger.getInstance, null, null);
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

  describe('getContext', function () {
    it('should return the function caller filename', function () {
      assert.equal(new Highlogger().getContext().split('/').pop(), 'runnable.js');
    });
  });

  describe('init', function () {
    describe('transporter', function () {
      it('should set a default transporter', function () {
        let highLogger = new Highlogger();
        assert.equal(highLogger.transporters.transporterList.length, 1);
        assert.ok(highLogger.transporters.transporterList[0] instanceof ConsoleTransporter);
      });

      it('should set a custom transporters', function () {
        let highLogger = new Highlogger([
          {type: 'console'},
          {type: 'syslog'},
          {type: 'socket', port: 0, address: '127.0.0.1', method: 'udp4'}
        ]);

        assert.equal(highLogger.transporters.transporterList.length, 3);
        assert.ok(highLogger.transporters.transporterList[2] instanceof SocketTransporter);
        assert.ok(highLogger.transporters.transporterList[1] instanceof SyslogTransporter);
        assert.ok(highLogger.transporters.transporterList[0] instanceof ConsoleTransporter);
      });

      it('should skip invalid transporter config', function () {
        let error0 = false,
            error1 = false;
        try {
          new Highlogger([1, 2]);
        } catch (e) {
          error0 = true;
        }

        try {
          new Highlogger([1, 2, {type: 'console'}]);
        } catch (e) {
          error1 = true;
        }

        assert.ok(error0);
        assert.ok(error1);
      });

      it('should call errorHandler on unsupported transporterType', function () {
        function invalidTransporter () {
          new Highlogger([{type: -1}]);
        }

        assert.throws(invalidTransporter);
      });
    });
  });

  describe('log', function () {

    describe('severity types', function () {
      let facilityName = 'sec',
          debug,
          context = 'foobarContext',
          facility = 10,
          port,
          port2,
          socket,
          socket2,
          message = 'foobar',
          tests = [
            ['emerg', 0],
            ['alert', 1],
            ['crit', 2],
            ['error', 3],
            ['warn', 4],
            ['notice', 5],
            ['info', 6],
            ['debug', 7]
          ];

      beforeEach(function (done) {
        debug = process.env.DEBUG;
        process.env.DEBUG='*';
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
        process.env.DEBUG = debug;
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
        it('should log ' + test[0], function (done) {

          let highLogger = new Highlogger([
                {type: 'syslog', port: port, facility: facilityName},
                {type: 'syslog', port: port2, facility: facilityName}
              ]),
              doneCount = 0;

          highLogger.getContext = function () {
            return context;
          };

          function doneWait () {
            doneCount++;
            if (doneCount === 2) {
              return done();
            }
          }

          socket.on("message", function (msg) {
            let messageSplitArray = msg.toString().split(' ');
            assert.equal(messageSplitArray[0], '<' + (facility*8+test[1]) + '>1');
            assert.equal(messageSplitArray[7], message+test[0]);
            doneWait();
          });

          socket2.on("message", function (msg) {
            let messageSplitArray = msg.toString().split(' ');
            assert.equal(messageSplitArray[0], '<' + (facility*8+test[1]) + '>1');
            assert.equal(messageSplitArray[7], message+test[0]);
            doneWait();
          });

          highLogger[test[0]](message+test[0]);
        });
      });

      it('should only log on transporters with matching severity range', function (done) {
        let highLogger = new Highlogger([
          {
            type: 'socket',
            port: port,
            severityMin: 'emerg',
            severityMax: 'emerg',
            address: '127.0.0.1',
            method: 'udp4',
            prependContext: true
          },
          {
            type: 'socket',
            port: port2,
            severityMin: 'info',
            severityMax: 'info',
            address: '127.0.0.1',
            method: 'udp4',
            prependContext: true
          }
            ]),
            doneCount = 0;

        function doneWait () {
          doneCount++;
          if (doneCount === 2) {
            return done();
          }
        }

        socket.on("message", function (msg) {
          assert.equal(msg.toString(), 'bar ' + message+'emerg');
          doneWait();
        });

        socket2.on("message", function (msg) {
          assert.equal(msg.toString(), 'bar ' + message+'info');
          doneWait();
        });

        highLogger.getEmerg("bar")(message + 'emerg');
        highLogger.getInfo("bar")(message + 'info');
      });
    });

    describe('json', function () {
      let port,
          context = 'foobarContext',
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
        let highLogger = new Highlogger([{type: 'syslog', port: port, json: true, prependContext: true}]),
            message = 'foobar';

        highLogger.getContext = function () {
          return context;
        };

        socket.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[7], JSON.stringify({message:message, context: context}));
          done();
        });

        highLogger.info(message);
      });

      it('should not wrap message inside curly braces', function (done) {
        let highLogger = new Highlogger([{type: 'syslog', port: port, json: false, prependContext: true}]),
            message = 'foobar';

        highLogger.getContext = function () {
          return context;
        };

        socket.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[7], context);
          assert.equal(messageSplitArray[8], message);
          done();
        });

        highLogger.info(message);
      });
    });

    describe('getDebug', function () {

      it('should return emptyDebug if debugKey is not included', function () {
        let debug = process.env.DEBUG,
            highLogger = new Highlogger(),
            highLogger2;

        highLogger.getContext = function () {
          return 'foo';
        };

        process.env.DEBUG = 'bar';
        highLogger2 = new Highlogger();

        highLogger2.getContext = function () {
          return 'bar';
        };

        assert.equal(typeof highLogger.getDebug(), 'function');
        assert.equal(highLogger.getDebug().name, 'emptyDebug');
        assert.equal(highLogger.getDebug("foobar").name, 'emptyDebug');
        assert.equal(typeof highLogger.getDebug('foo'), 'function');
        assert.equal(highLogger2.getDebug('foo').name, 'emptyDebug');

        process.env.DEBUG = debug;
      });

      it('should return emptyDebug if debugKey is excluded', function () {
        let debug = process.env.DEBUG,
            highLogger;

        process.env.DEBUG = '*, -foo*';
        highLogger = new Highlogger();

        assert.equal(typeof highLogger.getDebug('foo'), 'function');
        assert.equal(highLogger.getDebug('foo').name, 'emptyDebug');
        assert.equal(highLogger.getDebug('foo')(), undefined);
        process.env.DEBUG = debug;
      });

      it('should return debug if debugKey is included and not excluded', function () {
        let debug = process.env.DEBUG,
            highLogger;

        process.env.DEBUG = '*bar*, -*foo*';
        highLogger = new Highlogger();

        assert.equal(typeof highLogger.getDebug('ffffbar'), 'function');
        assert.equal(highLogger.getDebug('ffffbar').name, 'debugWithContext');
        assert.equal(typeof highLogger.getDebug('barfoobar'), 'function');
        assert.equal(highLogger.getDebug('barfoobar').name, 'emptyDebug');

        process.env.DEBUG = debug;
      });

      it('should set debugKey and set severity to debug', function (done) {
        let debug = process.env.DEBUG,
            socket = dgram.createSocket('udp4'),
            debugKey = 'foobar';

        process.env.DEBUG = '*';

        socket.on("error", function (err) {
          assert.ifError(err);
        });

        socket.bind(null, function () {
          let highLogger =  new Highlogger([{type: 'syslog', port: socket.address().port, facility: 'sec', prependContext: true}]),
              debugFn = highLogger.getDebug(debugKey);

          debugFn('message');
        });

        socket.on("message", function (msg) {
          let messageSplitArray = msg.toString().split(' ');
          assert.equal(messageSplitArray[7], debugKey);
          assert.equal(messageSplitArray[0], '<' + (10*8+constants.SEVERITY.debug) + '>1');

          process.env.DEBUG = debug;
          socket.close(done);
        });
      });
    });
  });

});