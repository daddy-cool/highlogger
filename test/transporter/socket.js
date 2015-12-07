'use strict';

let AbstractTransporter = require('../../lib/transporter/abstract'),
    SocketTransporter = require('../../lib/transporter/socket'),
    assert = require('assert'),
    dgram = require('dgram');

const SHARED_CONSTANTS = require('../../lib/shared-constants');

describe('transporter socket', function () {
  it('should inherit from AbstractTransporter', function () {
    let socketTransporter = new SocketTransporter({
      method: 'udp4',
      address: '127.0.0.1',
      port: 514
    });

    assert.ok(socketTransporter instanceof AbstractTransporter);
  });

  describe('set socket', function () {
    it('should initialize udp4 socket', function () {
      let socketTransporter = new SocketTransporter({
        method: 'udp4',
        address: '127.0.0.1',
        port: 514
      });

      assert.ok(typeof socketTransporter.socket !== 'undefined');
    });

    it('should not initialize without socket', function () {
      function invalidSocket () {
        new SocketTransporter({
          address: '127.0.0.1',
          port: 514
        });
      }

      assert.throws(invalidSocket);
    });
  });

  describe('set address', function () {
    it('should set an address', function () {
      let customAddress = '192.168.178.1',
          socketTransporter = new SocketTransporter({
            address: customAddress,
            port: 514,
            method: 'udp4'
          });

      assert.equal(socketTransporter.address, customAddress);
    });

    it('should not set a non-string address', function () {
      let customAddress = new Buffer('test');

      function invalidSocket () {
        new SocketTransporter({
          address: customAddress,
          method: 'udp4',
          port: 512
        });
      }

      assert.throws(invalidSocket);
    });
  });

  describe('set port', function () {

    it('should set a custom port', function () {
      let customPort = 22,
          socketTransporter = new SocketTransporter({
            port: customPort,
            method: 'udp4',
            address: '127.0.0.1'
          });

      assert.equal(socketTransporter.port, customPort);
    });

    it('should not set a non-numerical port', function () {
      let customPort = '22';

      function invalidSocket () {
        new SocketTransporter({
          port: customPort,
          method: 'udp4',
          address: '127.0.0.1'
        });
      }

      assert.throws(invalidSocket);
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
          port: socket.address().port,
          method: 'udp4',
          address: '127.0.0.1'
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

      function tryDone () {
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
          method: 'udp4',
          address: '127.0.0.1',
          port: socket.address().port
        });

        socketTransporter.write(message, {
          debugKey: debugKey,
          severity: SHARED_CONSTANTS.SEVERITY.debug
        });

        socketTransporter.write(message, {
          debugKey: debugKey
        });
      });
    });
  });
});