'use strict';

let Abstract = require('../../lib/transporters/abstract'),
    Socket = require('../../lib/transporters/socket'),
    assert = require('assert'),
    dgram = require('dgram'),
    defaultSocket = new Socket({address: '127.0.0.1', port: 514, method: 'udp4'});

describe('transporter socket', function () {

  describe('constructor', function () {

    it('should extend Abstract', function () {
      assert.ok(defaultSocket instanceof Abstract);
    });

    describe('sizeLimit', function () {

      it('should set default sizeLimit', function () {
        assert.equal(defaultSocket.sizeLimit, 512);
      });

      it('should set custom sizeLimit', function () {
        let abstract = new Socket({address: '127.0.0.1', port: 514, method: 'udp4', sizeLimit: 1});
        assert.equal(abstract.sizeLimit, 1);
      });

      it('should throw on invalid sizeLimit', function () {
        assert.throws(function () {
          new Socket({address: '127.0.0.1', port: 514, method: 'udp4', sizeLimit: 'foo'});
        }, null, null);
      });

    });

    describe('address', function () {

      it('should set custom address', function () {
        assert.equal(new Socket({address: '192.168.99.100', port: 514, method: 'udp4'}).address, '192.168.99.100');
      });

      it('should throw on invalid address', function () {
        assert.throws(function () {
          new Socket({address: true, port: 514, method: 'udp4'});
        }, null, null);
      });

    });

    describe('port', function () {

      it('should set custom port', function () {
        assert.equal(new Socket({address: '192.168.99.100', port: 777, method: 'udp4'}).port, 777);
      });

      it('should throw on invalid port', function () {
        assert.throws(function () {
          new Socket({address: '192.168.99.100', port: true, method: 'udp4'});
        }, null, null);
      });

    });

    describe('method', function () {

      it('should set custom method', function () {
        assert.equal(new Socket({address: '192.168.99.100', port: 777, method: 'udp4'}).socket.type, 'udp4');
      });

      it('should throw on invalid method', function () {
        assert.throws(function () {
          new Socket({address: '192.168.99.100', port: 777, method: 'foobar'});
        }, null, null);
      });

    });

  });

  it('should write to socket', function (done) {
    let receiver = dgram.createSocket('udp4'),
        message = 'foobar';

    receiver.on("error", function (err) {
      assert.ifError(err);
      receiver.close(done);
    });

    receiver.on("message", function (msg) {
      assert.equal(msg.toString(), message);
      receiver.close(done);
    });

    receiver.bind(null, function () {
      let sender = new Socket({
        port: receiver.address().port,
        method: 'udp4',
        address: '127.0.0.1'
      });

      sender.write(message, 0, function () {});
    });
  });

});