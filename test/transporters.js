'use strict';

let HighLogger = require('../index'),
    AbstractTransporter = require('../lib/transporter/abstract'),
    ConsoleTransporter = require('../lib/transporter/console'),
    SocketTransporter = require('../lib/transporter/socket'),
    SyslogTransporter = require('../lib/transporter/syslog'),
    assert = require('assert'),
    dgram = require('dgram'),
    stream = require('stream');

function errorHandler (err) {
  assert.ifError(err);
}

describe('transporters', function () {

  describe('abstract', function () {
    it('should not write', function (done) {
      let abstractTransporter = new AbstractTransporter({errorHandler: errorHandler});

      abstractTransporter.write(null, null, function (err) {
        assert.equal(err.message, 'AbstractTransporter.write method was not overwritten');
        done();
      });
    });

    it('should set default severity', function () {
      let abstractTransporter = new AbstractTransporter({errorHandler: errorHandler});

      assert.equal(abstractTransporter.severity.minimum, HighLogger.SEVERITY.EMERG);
      assert.equal(abstractTransporter.severity.maximum, HighLogger.SEVERITY.DEBUG);
    });

    it('should set custom severity', function () {
      let abstractTransporter = new AbstractTransporter({
        errorHandler: errorHandler,
        severity: {
          minimum: HighLogger.SEVERITY.ERROR,
          maximum: HighLogger.SEVERITY.INFO
        }
      });

      assert.equal(abstractTransporter.severity.minimum, HighLogger.SEVERITY.ERROR);
      assert.equal(abstractTransporter.severity.maximum, HighLogger.SEVERITY.INFO);
    });
  });

  describe('console', function () {
    it('should inherit from AbstractTransporter', function () {
      let consoleTransporter = new ConsoleTransporter({errorHandler: errorHandler});

      assert.ok(consoleTransporter instanceof AbstractTransporter);
    });

    it('should write to output and error', function (done) {
      let doneCount = 0,
          doneWait = function () {
            doneCount++;
            if (doneCount === 2) {
              return done();
            }
          },
          messageOutput = 'foobarOut',
          messageError = 'foobarErr',
          writableOutputStream = new stream.Writable({
            write: function (chunk) {
              assert.equal(chunk.toString(), messageOutput + '\n');
              doneWait();
            }
          }),
          writableErrorStream = new stream.Writable({
            write: function (chunk) {
              assert.equal(chunk.toString(), messageError + '\n');
              doneWait();
            }
          }),
          consoleTransporter = new ConsoleTransporter({
            errorHandler: errorHandler,
            streams: {
              output: writableOutputStream,
              error: writableErrorStream
            }
          });

      consoleTransporter.write(messageOutput, {severity: 5}, function (err) {
        assert.ifError(err);
      });
      consoleTransporter.write(messageError, {severity: 4}, function (err) {
        assert.ifError(err);
      });
    });
  });

  describe('socket', function () {
    it('should inherit from AbstractTransporter', function () {
      let socketTransporter = new SocketTransporter({errorHandler: errorHandler});

      assert.ok(socketTransporter instanceof AbstractTransporter);
    });

    it('should initialize the socket', function () {
      let socketTransporter = new SocketTransporter({errorHandler: errorHandler});

      assert.ok(typeof socketTransporter.socket !== 'undefined');
    });

    it('should set the default address', function () {
      let socketTransporter = new SocketTransporter({errorHandler: errorHandler});

      assert.equal(socketTransporter.address, '127.0.0.1');
    });

    it('should set a custom address', function () {
      let customAddress = '192.168.178.1',
          socketTransporter = new SocketTransporter({errorHandler: errorHandler, address: customAddress});

      assert.equal(socketTransporter.address, customAddress);
    });

    it('should set the default port', function () {
      let socketTransporter = new SocketTransporter({errorHandler: errorHandler});

      assert.equal(socketTransporter.port, 514);
    });

    it('should set a custom port', function () {
      let customPort = 22,
          socketTransporter = new SocketTransporter({port: customPort});

      assert.equal(socketTransporter.port, customPort);
    });

    it('should write', function (done) {
      let socket = dgram.createSocket('udp4'),
          message = 'foobar';

      socket.on("error", function (err) {
        assert.ifError(err);
        socket.close(done);
      });

      socket.on("message", function (msg) {
        assert.equal(msg.toString(), message);
        socket.close(done);
      });

      socket.bind(null, function () {
        let socketTransporter = new SocketTransporter({
          errorHandler: errorHandler,
          port: socket.address().port
        });

        socketTransporter.write(message);
      });
    });
  });

  describe('syslog', function () {
    it('should inherit from SocketTransporter', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

      assert.ok(syslogTransporter instanceof SocketTransporter);
    });
  });

});