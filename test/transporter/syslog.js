
'use strict';

let HighLogger = require('../../highlogger'),
    SocketTransporter = require('../../lib/transporter/socket'),
    SyslogTransporter = require('../../lib/transporter/syslog'),
    assert = require('assert');

function errorHandler (err) {
  assert.ifError(err);
}

describe('transporter syslog', function () {
  it('should inherit from SocketTransporter', function () {
    let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

    assert.ok(syslogTransporter instanceof SocketTransporter);
  });

  describe('set facility', function () {
    it('should set the default facility', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

      assert.equal(syslogTransporter.facility, HighLogger.FACILITY.USER * 8);
    });

    it('should set a custom facility', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, facility: HighLogger.FACILITY.LOCAL0});

      assert.equal(syslogTransporter.facility, HighLogger.FACILITY.LOCAL0 * 8);
    });

    it('should not set a non-numerical facility', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, facility: 'foobar'});

      assert.notEqual(syslogTransporter.facility, 'foobar');
    });
  });

  describe('set hostname', function () {
    it('should set the default hostname', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

      assert.equal(syslogTransporter.hostname, require('os').hostname());
    });

    it('should set a custom hostname', function () {
      let hostname = 'foobar',
          syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, hostname: hostname});

      assert.equal(syslogTransporter.hostname, hostname);
    });

    it('should filter hostname to be PRINTUSASCII valid and max 255 chars', function () {
      let hostname = '',
          printUsAsciiHostname,
          syslogTransporter;

      while (hostname.length < 255) {
        hostname += 'foobar';
      }
      hostname = hostname.substring(0, 255);
      printUsAsciiHostname = hostname;
      hostname = hostname.replace(new RegExp('foobar', 'g'), '\x20öäfoobar\x7fßü');

      syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, hostname: hostname});

      assert.equal(syslogTransporter.hostname, printUsAsciiHostname);
    });

    it('should not set a  non-string hostname', function () {
      let hostname = new Buffer('foobar'),
          syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, hostname: hostname});

      assert.notEqual(syslogTransporter.hostname, hostname);
    });
  });

  describe('set appName', function () {
    it('should set the default appName', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

      assert.equal(syslogTransporter.appName, '-');
    });

    it('should set a custom appName', function () {
      let appName = 'foobar',
          syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, appName: appName});

      assert.equal(syslogTransporter.appName, appName);
    });

    it('should filter appName to be PRINTUSASCII valid and max 48 chars', function () {
      let appName = '',
          printUsAsciiHostname,
          syslogTransporter;

      while (appName.length < 48) {
        appName += 'foobar';
      }
      appName = appName.substring(0, 48);
      printUsAsciiHostname = appName;
      appName = appName.replace(new RegExp('foobar', 'g'), '\x20öäfoobar\x7fßü');

      syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, appName: appName});

      assert.equal(syslogTransporter.appName, printUsAsciiHostname);
    });

    it('should not set a  non-string appName', function () {
      let appName = new Buffer('foobar'),
          syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, appName: appName});

      assert.notEqual(syslogTransporter.appName, appName);
    });
  });

  describe('set processId', function () {
    it('should set the default processId', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

      assert.equal(syslogTransporter.processId, process.pid);
    });

    it('should set a custom processId', function () {
      let processId = 'foobar',
          syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, processId: processId});

      assert.equal(syslogTransporter.processId, processId);
    });

    it('should filter processId to be PRINTUSASCII valid and max 128 chars', function () {
      let processId = '',
          printUsAsciiHostname,
          syslogTransporter;

      while (processId.length < 128) {
        processId += 'foobar';
      }
      processId = processId.substring(0, 128);
      printUsAsciiHostname = processId;
      processId = processId.replace(new RegExp('foobar', 'g'), '\x20öäfoobar\x7fßü');

      syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, processId: processId});

      assert.equal(syslogTransporter.processId, printUsAsciiHostname);
    });

    it('should not set a non-string processId', function () {
      let processId = new Buffer('foobar'),
          syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, processId: processId});

      assert.notEqual(syslogTransporter.processId, processId);
    });
  });

  describe('set json', function () {
    it('should set default json', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

      assert.equal(syslogTransporter.json, false);
    });

    it('should set custom json', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, json: true});

      assert.equal(syslogTransporter.json, true);
    });

    it('should not set non-boolean json', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, json: 'foobar'});

      assert.equal(syslogTransporter.json, false);
    });
  });

  describe.skip('write', function () {
    it('should write', function (done) {

    });
  });
});