'use strict';

let SocketTransporter = require('../../lib/transporters/socket'),
    SyslogTransporter = require('../../lib/transporters/syslog'),
    moment = require('moment'),
    parseFormat = require('moment-parseformat'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    dgram = require('dgram');

const SHARED_CONSTANTS = require('../../lib/helpers/constants');

describe('transporter syslog', function () {
  describe('init', function () {
    it('should inherit from SocketTransporter', function () {
      let syslogTransporter = new SyslogTransporter({});

      assert.ok(syslogTransporter instanceof SocketTransporter);
    });

    describe('set address', function () {
      it('should set the default address', function () {
        let syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.address, '127.0.0.1');
      });

      it('should set a custom address', function () {
        let syslogTransporter = new SyslogTransporter({address: 'foobar'});

        assert.equal(syslogTransporter.address, 'foobar');
      });

      it('should not set a non-string address', function () {
        let syslogTransporter = new SyslogTransporter({address: 123});

        assert.equal(syslogTransporter.address, '127.0.0.1');
      });
    });

    describe('set port', function () {
      it('should set the default port', function () {
        let syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.port, 514);
      });

      it('should set a custom port', function () {
        let syslogTransporter = new SyslogTransporter({port: 12345});

        assert.equal(syslogTransporter.port, 12345);
      });

      it('should not set a non-numerical port', function () {
        let syslogTransporter = new SyslogTransporter({port: '123'});

        assert.equal(syslogTransporter.port, 514);
      });
    });

    describe('set method', function () {
      it('should set the default method', function () {
        let syslogTransporter1 = new SyslogTransporter({}),
            syslogTransporter2 = new SyslogTransporter({method: 'udp6'}),
            syslogTransporter3 = new SyslogTransporter({method: null});

        assert.ok(typeof syslogTransporter1.socket !== 'undefined');
        assert.ok(typeof syslogTransporter2.socket !== 'undefined');
        assert.ok(typeof syslogTransporter3.socket !== 'undefined');
      });
    });

    describe('set facility', function () {
      it('should set the default facility', function () {
        let syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.facility, 8);
      });

      it('should set a custom facility', function () {
        let syslogTransporter = new SyslogTransporter({facility: 'local0'});

        assert.equal(syslogTransporter.facility, 16 * 8);
      });

      it('should not set a non-numerical facility', function () {
        let syslogTransporter = new SyslogTransporter({facility: 'foobar'});

        assert.notEqual(syslogTransporter.facility, 'foobar');
      });
    });

    describe('set hostname', function () {
      it('should set the default hostname', function () {
        let syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.hostname, require('os').hostname());
      });

      it('should set a custom hostname', function () {
        let hostname = 'foobar',
            syslogTransporter = new SyslogTransporter({hostname: hostname});

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

        syslogTransporter = new SyslogTransporter({hostname: hostname});
        assert.equal(syslogTransporter.hostname, printUsAsciiHostname);


        syslogTransporter = new SyslogTransporter({hostname: '\x20\x7f'});
        assert.equal(syslogTransporter.hostname, '-');
      });

      it('should not set a non-string hostname', function () {
        let hostname = new Buffer('foobar'),
            syslogTransporter = new SyslogTransporter({hostname: hostname});

        assert.notEqual(syslogTransporter.hostname, hostname);
      });
    });

    describe('set appName', function () {
      it('should set the default appName to "-" if package.json not found', function () {
        let syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.appName, '-');
      });

      it('should set the default appName to package.json name', function () {
        let syslogTransporter,
            moduleName = 'highlogger',
            packageJson = '{"name": "' + moduleName + '"}',
            dir = require.main.filename.split(path.sep);

        dir.pop();
        dir.push('package.json');
        dir = dir.join(path.sep);

        fs.writeFileSync(dir, packageJson);

        syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.appName, 'highlogger');

        fs.unlinkSync(dir);
      });

      it('should set a custom appName', function () {
        let appName = 'foobar',
            syslogTransporter = new SyslogTransporter({appName: appName});

        assert.equal(syslogTransporter.appName, appName);
      });

      it('should filter appName to be PRINTUSASCII valid and max 48 chars', function () {
        let appName = '',
            printUsAsciiAppName,
            syslogTransporter;

        while (appName.length < 48) {
          appName += 'foobar';
        }
        appName = appName.substring(0, 48);
        printUsAsciiAppName = appName;
        appName = appName.replace(new RegExp('foobar', 'g'), '\x20öäfoobar\x7fßü');

        syslogTransporter = new SyslogTransporter({appName: appName});
        assert.equal(syslogTransporter.appName, printUsAsciiAppName);

        syslogTransporter = new SyslogTransporter({appName: '\x20\x7f'});
        assert.equal(syslogTransporter.appName, '-');
      });

      it('should not set a non-string appName', function () {
        let appName = new Buffer('foobar'),
            syslogTransporter = new SyslogTransporter({appName: appName});

        assert.notEqual(syslogTransporter.appName, appName);
      });
    });

    describe('set processId', function () {
      it('should set the default processId', function () {
        let syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.processId, process.pid);
      });

      it('should set a custom processId', function () {
        let processId = 'foobar',
            syslogTransporter = new SyslogTransporter({processId: processId});

        assert.equal(syslogTransporter.processId, processId);
      });

      it('should filter processId to be PRINTUSASCII valid and max 128 chars', function () {
        let processId = '',
            printUsAsciiProcessId,
            syslogTransporter;

        while (processId.length < 128) {
          processId += 'foobar';
        }
        processId = processId.substring(0, 128);
        printUsAsciiProcessId = processId;
        processId = processId.replace(new RegExp('foobar', 'g'), '\x20öäfoobar\x7fßü');

        syslogTransporter = new SyslogTransporter({processId: processId});
        assert.equal(syslogTransporter.processId, printUsAsciiProcessId);

        syslogTransporter = new SyslogTransporter({processId: '\x20\x7f'});
        assert.equal(syslogTransporter.processId, '-');
      });

      it('should not set a non-string processId', function () {
        let processId = new Buffer('foobar'),
            syslogTransporter = new SyslogTransporter({processId: processId});

        assert.notEqual(syslogTransporter.processId, processId);
      });
    });

    describe('set json', function () {
      it('should set default json', function () {
        let syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.json, false);
      });

      it('should set custom json', function () {
        let syslogTransporter = new SyslogTransporter({json: true});

        assert.equal(syslogTransporter.syslogJson, true);
      });

      it('should not set non-boolean json', function () {
        let syslogTransporter = new SyslogTransporter({json: 'foobar'});

        assert.equal(syslogTransporter.json, false);
      });
    });

    describe('set timezone offset', function () {
      let timezoneOffsetTests = [
        ['should set default timezone to local timezone', undefined, moment().utcOffset()],
        ['should set custom timezone', 0, 0],
        ['should not set invalid timezone', -20, moment().utcOffset()],
        ['should not set non-numerical timezone', '10', moment().utcOffset()]
      ];

      timezoneOffsetTests.forEach(function (timezoneOffsetTest) {
        it(timezoneOffsetTest[0], function () {
          let syslogTransporter = new SyslogTransporter({timezoneOffset: timezoneOffsetTest[1]});
          assert.equal(syslogTransporter.timezoneOffset, timezoneOffsetTest[2]);
        });
      });
    });
  });

  describe('write', function () {
    describe('filter messageId', function () {
      it('should set the default messageId', function () {
        let syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.filterMessageId(), '-');
      });

      it('should set a custom messageId', function () {
        let messageId = 'foobar',
            syslogTransporter = new SyslogTransporter({});

        assert.equal(syslogTransporter.filterMessageId(messageId), messageId);
      });

      it('should filter messageId to be PRINTUSASCII valid and max 32 chars', function () {
        let messageId = '',
            printUsAsciiMessageId,
            syslogTransporter;

        while (messageId.length < 32) {
          messageId += 'foobar';
        }
        messageId = messageId.substring(0, 32);
        printUsAsciiMessageId = messageId;
        messageId = messageId.replace(new RegExp('foobar', 'g'), '\x20öäfoobar\x7fßü');

        syslogTransporter = new SyslogTransporter({});
        assert.equal(syslogTransporter.filterMessageId(messageId), printUsAsciiMessageId);
        assert.equal(syslogTransporter.filterMessageId('\x20\x7f'), '-');
      });

      it('should not set a non-string messageId', function () {
        let syslogTransporter = new SyslogTransporter({});

        //noinspection JSCheckFunctionSignatures
        assert.equal(syslogTransporter.filterMessageId(new Buffer('foobar')), '-');
      });
    });

    it('should format the message according to RFC5424 and write to socket', function (done) {
      let severity = 6,
          hostname = 'testHost',
          appName = 'testApp',
          processId = 'testProcessId',
          message = 'foobar',
          socket = dgram.createSocket('udp4');

      socket.on("error", function (err) {
        assert.ifError(err);
        socket.close(done);
      });

      socket.on("message", function (msg) {
        let messageSplitArray = msg.toString().split(' ');
        assert.equal(messageSplitArray[0], '<' + (10*8+severity) + '>1');
        assert.equal(parseFormat(messageSplitArray[1]), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        assert.equal(messageSplitArray[2], hostname);
        assert.equal(messageSplitArray[3], appName);
        assert.equal(messageSplitArray[4], processId);
        assert.equal(messageSplitArray[7], message);
        socket.close(done);
      });

      socket.bind(null, function () {
        let syslogTransporter = new SyslogTransporter({
          port: socket.address().port,
          facility: 'sec',
          hostname: hostname,
          appName: appName,
          processId: processId
        });

        syslogTransporter.write(message, {
          severity: severity
        }, function (err) {
          assert.ifError(err);
        });
      });
    });

    it('should use debugKey as messageId only on debug severity', function (done) {
      let debugKey = 'foobarDebugKey',
          message = 'foobarMsg',
          socket = dgram.createSocket('udp4'),
          debugRequest = false,
          infoRequest = false,
          triedDone = 0;

      socket.on("error", function (err) {
        assert.ifError(err);
        socket.close(done);
      });

      function tryDone () {
        triedDone++;
        if (triedDone === 2) {
          assert.ok(debugRequest);
          assert.ok(infoRequest);
          socket.close(done);
        }
      }

      socket.on("message", function (msg) {
        let messageSplitArray = msg.toString().split(' ');
        assert.equal(messageSplitArray[7], message);

        if (messageSplitArray[0] === '<' + (10*8+SHARED_CONSTANTS.SEVERITY.debug) + '>1') {
          assert.equal(messageSplitArray[5], debugKey);
          debugRequest = true;
        } else if (messageSplitArray[0] === '<' + (10*8+SHARED_CONSTANTS.SEVERITY.info) + '>1') {
          assert.equal(messageSplitArray[5], '-');
          infoRequest = true;
        } else {
          assert.fail('this should never happen');
        }

        tryDone(socket);
      });

      socket.bind(null, function () {
        let syslogTransporter = new SyslogTransporter({
          port: socket.address().port,
          facility: 'sec'
        });

        syslogTransporter.write(message, {
          severity: SHARED_CONSTANTS.SEVERITY.debug,
          debugKey: debugKey
        }, function (err) {
          assert.ifError(err);
        });

        syslogTransporter.write(message, {
          severity: SHARED_CONSTANTS.SEVERITY.info,
          debugKey: debugKey
        }, function (err) {
          assert.ifError(err);
        });
      });
    });

  });
});