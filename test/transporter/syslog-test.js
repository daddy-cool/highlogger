'use strict';

let Socket = require('../../lib/transporters/socket'),
    Syslog = require('../../lib/transporters/syslog'),
    moment = require('moment'),
    parseFormat = require('moment-parseformat'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    dgram = require('dgram'),
    osHostname = require('os').hostname(),
    defaultSyslog = new Syslog({}),
    constants = require('../../lib/helpers/constants');

describe('transporter syslog', function () {

  describe('constructor', function () {

    it('should extend Socket', function () {
      assert.ok(defaultSyslog instanceof Socket);
    });

    describe('facility', function () {

      it('should set default facility', function () {
        assert.equal(defaultSyslog.facility, 8);
      });

      it('should set custom facility', function () {
        assert.equal(new Syslog({facility: 'kern'}).facility, 0);
      });

      it('should set custom facility', function () {
        assert.throws(function () {
          new Syslog({facility: 'foobar'});
        }, null, null);
      });

    });

    describe('hostname', function () {

      it('should set default hostname', function () {
        assert.equal(defaultSyslog.hostname, osHostname);
      });

      it('should set custom hostname', function () {
        assert.equal(new Syslog({hostname: 'foobar'}).hostname, 'foobar');
      });

      it('should throw on invalid hostname', function () {
        assert.throws(function () {
          new Syslog({hostname: true});
        }, null, null);
      });

    });

    describe('appName', function () {

      it('should set default appName (without package.json)', function () {
        assert.equal(defaultSyslog.appName, '-');
      });

      it('should set default appName (with package.json)', function (done) {
        let appDir = path.dirname(require.main.filename),
            packageJson = path.join(appDir, 'package.json');

        fs.writeFile(packageJson, '{"name":"foo/bar"}', function () {
          try {
            assert.equal(new Syslog({}).appName, require(packageJson).name.split('/').pop());
          } catch (e) {
            assert.ifError(e);
          }
          fs.unlink(packageJson, done);
        });
      });

      it('should set custom appName', function () {
        assert.equal(new Syslog({appName: 'foobar'}).appName, 'foobar');
      });

      it('should throw on invalid appName', function () {
        assert.throws(function () {
          new Syslog({appName: true});
        }, null, null);
      });

    });

    describe('processId', function () {

      it('should set default processId', function () {
        assert.equal(defaultSyslog.processId, process.pid);
      });

      it('should set custom processId', function () {
        assert.equal(new Syslog({processId: 'foobar'}).processId, 'foobar');
      });

      it('should throw on invalid processId', function () {
        assert.throws(function () {
          new Syslog({processId: true});
        }, null, null);
      });

    });

    describe('sizeLimit', function () {

      it('should set default sizeLimit', function () {
        let socket = new Socket({address: '127.0.0.1', port: 514, method: 'udp4'});
        assert.equal(defaultSyslog.sizeLimit, socket.sizeLimit - defaultSyslog.getSyslogPrefix(constants.SEVERITY.debug).length);
      });

      it('should set custom sizeLimit', function () {
        let syslog = new Syslog({sizeLimit: 2000});
        assert.equal(syslog.sizeLimit, 2000 - syslog.getSyslogPrefix(constants.SEVERITY.debug).length);
      });

      it('should throw on invalid sizeLimit', function () {
        assert.throws(function () {
          new Syslog({sizeLimit: true});
        }, null, null);
      });

    });

    describe('method', function () {

      it('should set default method', function () {
        assert.equal(defaultSyslog.socket.type, 'udp4');
      });

      it('should set custom method', function () {
        assert.equal(new Syslog({method: 'udp4'}).socket.type, 'udp4');
      });

      it('should throw on invalid method', function () {
        assert.throws(function () {
          new Syslog({method: 'foobar'});
        }, null, null);
      });

    });

    describe('address', function () {

      it('should set default address', function () {
        assert.equal(defaultSyslog.address, '127.0.0.1');
      });

      it('should set custom address', function () {
        assert.equal(new Syslog({address: '0.0.0.0'}).address, '0.0.0.0');
      });

      it('should throw on invalid address', function () {
        assert.throws(function () {
          new Syslog({address: true});
        }, null, null);
      });

    });

    describe('port', function () {

      it('should set default port', function () {
        assert.equal(defaultSyslog.port, 514);
      });

      it('should set custom port', function () {
        assert.equal(new Syslog({port: 12}).port, 12);
      });

      it('should throw on invalid port', function () {
        assert.throws(function () {
          new Syslog({port: true});
        }, null, null);
      });

    });

    describe('timezoneOffset', function () {

      it('should set default timezoneOffset', function () {
        assert.equal(defaultSyslog.timezoneOffset, moment().utcOffset());
      });

      it('should set custom timezoneOffset', function () {
        assert.equal(new Syslog({timezoneOffset: 12}).timezoneOffset, 12);
      });

      it('should throw on invalid timezoneOffset', function () {
        assert.throws(function () {
          new Syslog({timezoneOffset: 17});
        }, null, null);
      });

    });

  });

  it('should set correct syslogPrefix', function () {
    let syslogPrefixArrayExpected = [
          '<10>1',
          null,
          osHostname,
          '-',
          process.pid,
          '-',
          '-',
          ''
        ],
        syslogPrefixArrayActual = defaultSyslog.getSyslogPrefix(constants.SEVERITY.crit).split(' ');

    for (let s = 0; s < syslogPrefixArrayActual.length; s++) {
      if (s === 1) {
        continue;
      }
      assert.equal(syslogPrefixArrayActual[s], syslogPrefixArrayExpected[s]);
    }

    //noinspection SpellCheckingInspection
    assert.equal(parseFormat(syslogPrefixArrayActual[1]), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
  });

  it('should log to socket with syslogPrefix', function (done) {
    let receiver = dgram.createSocket('udp4'),
        message = 'foo',
        context = 'bar',
        syslogPrefixArrayExpected = [
          '<15>1',
          null,
          osHostname,
          '-',
          process.pid,
          '-',
          '-',
          JSON.stringify({message: message})
        ];

    receiver.on("error", function (err) {
      assert.ifError(err);
      receiver.close(done);
    });

    receiver.on("message", function (msg) {
      let msgArray = msg.toString().split(' ');
      for (let s = 0; s < msgArray.length; s++) {
        if (s === 1) {
          continue;
        }
        assert.equal(msgArray[s], syslogPrefixArrayExpected[s]);
      }

      //noinspection SpellCheckingInspection
      assert.equal(parseFormat(msgArray[1]), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      receiver.close(done);
    });

    receiver.bind(null, function () {
      let sender = new Syslog({
        port: receiver.address().port,
        method: 'udp4',
        address: '127.0.0.1',
        json: true
      });

      sender.log(message, 7, context, function () {});
    });
  });

});