'use strict';

let AbstractTransporter = require('../../lib/transporter/abstract'),
    SocketTransporter = require('../../lib/transporter/socket'),
    assert = require('assert'),
    dgram = require('dgram');

const SHARED_CONSTANTS = require('../../lib/shared-constants');

function errorHandler (err) {
  assert.ifError(err);
}

describe('transporter socket', function () {
  it('should inherit from AbstractTransporter', function () {
    let socketTransporter = new SocketTransporter({errorHandler: errorHandler});

    assert.ok(socketTransporter instanceof AbstractTransporter);
  });

  describe('set socket', function () {
    it('should initialize the default socket', function () {
      let socketTransporter = new SocketTransporter({errorHandler: errorHandler});

      assert.ok(typeof socketTransporter.socket !== 'undefined');
    });

    it('should initialize udp4 socket', function () {
      let socketTransporter = new SocketTransporter({errorHandler: errorHandler, method: 'udp'});

      assert.ok(typeof socketTransporter.socket !== 'undefined');
    });

    it('should not initialize other socket', function (done) {
      let doneCount = 0,
          socketTransporter;

      function doneWait () {
        doneCount++;
        if (doneCount === 2) {
          return done();
        }
      }

      socketTransporter = new SocketTransporter({errorHandler: function (err) {
        assert.equal(err.message, 'unsupported socket method "tcp"');
        doneWait();
      }, method: 'tcp'});

      assert.equal(typeof socketTransporter.socket, 'undefined');
      doneWait();
    });
  });

  describe('set address', function () {
    it('should set the default address', function () {
      let socketTransporter = new SocketTransporter({errorHandler: errorHandler});

      assert.equal(socketTransporter.address, '127.0.0.1');
    });

    it('should set a custom address', function () {
      let customAddress = '192.168.178.1',
          socketTransporter = new SocketTransporter({errorHandler: errorHandler, address: customAddress});

      assert.equal(socketTransporter.address, customAddress);
    });

    it('should not set a non-string address', function () {
      let customAddress = new Buffer('test'),
          socketTransporter = new SocketTransporter({errorHandler: errorHandler, address: customAddress});

      assert.notEqual(socketTransporter.address, customAddress);
    });
  });

  describe('set port', function () {
    it('should set the default port', function () {
      let socketTransporter = new SocketTransporter({errorHandler: errorHandler});

      assert.equal(socketTransporter.port, 514);
    });

    it('should set a custom port', function () {
      let customPort = 22,
          socketTransporter = new SocketTransporter({port: customPort});

      assert.equal(socketTransporter.port, customPort);
    });

    it('should not set a non-numerical port', function () {
      let customPort = '22',
          socketTransporter = new SocketTransporter({port: customPort});

      assert.notEqual(socketTransporter.port, customPort);
    });
  });

  describe('write', function () {
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

    it('should only prepend debugKey on severity debug', function (done) {
      let socket = dgram.createSocket('udp4'),
          message = 'foobarMessage',
          debugKey = 'foobarDebugKey',
          debugRequest = false,
          infoRequest = false,
          triedDone = 0;

      function tryDone(socket) {
        triedDone++;
        if (triedDone === 2) {
          assert.ok(debugRequest);
          assert.ok(infoRequest);
          socket.close(done);
        }
      }

      socket.on("error", function (err) {
        assert.ifError(err);
        socket.close(done);
      });

      socket.on("message", function (msg) {
        msg = msg.toString();
        if (msg === debugKey + ' ' + message) {
          assert.equal(msg, debugKey + ' ' + message);
          debugRequest = true;
        } else {
          assert.equal(msg, message);
          infoRequest = true;
        }

        tryDone(socket);
      });

      socket.bind(null, function () {
        let socketTransporter = new SocketTransporter({
          errorHandler: errorHandler,
          port: socket.address().port
        });

        socketTransporter.write(message, {
          debugKey: debugKey,
          severity: SHARED_CONSTANTS.SEVERITY.DEBUG
        });

        socketTransporter.write(message, {
          debugKey: debugKey
        });
      });
    });
  });
});