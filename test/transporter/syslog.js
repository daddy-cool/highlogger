'use strict';

let SocketTransporter = require('../../lib/transporter/socket'),
    SyslogTransporter = require('../../lib/transporter/syslog'),
    moment = require('moment'),
    parseFormat = require('moment-parseformat'),
    assert = require('assert'),
    dgram = require('dgram');

const SHARED_CONSTANTS = require('../../lib/shared-constants');

function errorHandler (err) {
  assert.ifError(err);
}

describe('transporter syslog', function () {
  describe('init', function () {
    it('should inherit from SocketTransporter', function () {
      let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

      assert.ok(syslogTransporter instanceof SocketTransporter);
    });

    describe('set facility', function () {
      it('should set the default facility', function () {
        let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

        assert.equal(syslogTransporter.facility, SHARED_CONSTANTS.FACILITY.USER * 8);
      });

      it('should set a custom facility', function () {
        let syslogTransporter = new SyslogTransporter({
          errorHandler: errorHandler,
          facility: SHARED_CONSTANTS.FACILITY.LOCAL0
        });

        assert.equal(syslogTransporter.facility, SHARED_CONSTANTS.FACILITY.LOCAL0 * 8);
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


        syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, hostname: '\x20\x7f'});
        assert.equal(syslogTransporter.hostname, '-');
      });

      it('should not set a non-string hostname', function () {
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
            printUsAsciiAppName,
            syslogTransporter;

        while (appName.length < 48) {
          appName += 'foobar';
        }
        appName = appName.substring(0, 48);
        printUsAsciiAppName = appName;
        appName = appName.replace(new RegExp('foobar', 'g'), '\x20öäfoobar\x7fßü');

        syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, appName: appName});
        assert.equal(syslogTransporter.appName, printUsAsciiAppName);

        syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, appName: '\x20\x7f'});
        assert.equal(syslogTransporter.appName, '-');
      });

      it('should not set a non-string appName', function () {
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
            printUsAsciiProcessId,
            syslogTransporter;

        while (processId.length < 128) {
          processId += 'foobar';
        }
        processId = processId.substring(0, 128);
        printUsAsciiProcessId = processId;
        processId = processId.replace(new RegExp('foobar', 'g'), '\x20öäfoobar\x7fßü');

        syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, processId: processId});
        assert.equal(syslogTransporter.processId, printUsAsciiProcessId);

        syslogTransporter = new SyslogTransporter({errorHandler: errorHandler, processId: '\x20\x7f'});
        assert.equal(syslogTransporter.processId, '-');
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

    describe('set timezone offset', function () {
      //noinspection JSUnresolvedFunction
      let timezoneOffsetTests = [
        ['should set default timezone to local timezone', undefined, moment().utcOffset()],
        ['should set custom timezone', 0, 0],
        ['should not set invalid timezone', -20, moment().utcOffset()],
        ['should not set non-numerical timezone', '10', moment().utcOffset()]
      ];

      timezoneOffsetTests.forEach(function (timezoneOffsetTest) {
        it(timezoneOffsetTest[0], function () {
          let syslogTransporter = new SyslogTransporter({
            errorHandler: errorHandler,
            timezoneOffset: timezoneOffsetTest[1]
          });
          assert.equal(syslogTransporter.timezoneOffset, timezoneOffsetTest[2]);
        });
      });
    });
  });

  describe('write', function () {
    describe('filter messageId', function () {
      it('should set the default messageId', function () {
        let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

        assert.equal(syslogTransporter.filterMessageId(), '-');
      });

      it('should set a custom messageId', function () {
        let messageId = 'foobar',
            syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

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

        syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});
        assert.equal(syslogTransporter.filterMessageId(messageId), printUsAsciiMessageId);
        assert.equal(syslogTransporter.filterMessageId('\x20\x7f'), '-');
      });

      it('should not set a non-string messageId', function () {
        let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

        //noinspection JSCheckFunctionSignatures
        assert.equal(syslogTransporter.filterMessageId(new Buffer('foobar')), '-');
      });
    });

    describe('filter structuredData', function () {
      it('should set the default structuredData', function () {
        let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

        assert.equal(syslogTransporter.filterStructuredData(), '-');
      });

      it('should set a custom structuredData', function () {
        let structuredData = 'foobar',
            syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

        assert.equal(syslogTransporter.filterStructuredData(structuredData), structuredData);
      });

      it('should not set a non-string structuredData', function () {
        let syslogTransporter = new SyslogTransporter({errorHandler: errorHandler});

        //noinspection JSCheckFunctionSignatures
        assert.equal(syslogTransporter.filterStructuredData(new Buffer('foobar')), '-');
      });
    });

    it('should format the message according to RFC5424 and write to socket', function (done) {
      let facility = 10,
          severity = 6,
          hostname = 'testHost',
          appName = 'testApp',
          processId = 'testProcessId',
          messageId = 'testMessageId',
          structuredData = 'testStructuredData',
          message = 'foobar',
          socket = dgram.createSocket('udp4');

      socket.on("error", function (err) {
        assert.ifError(err);
        socket.close(done);
      });

      socket.on("message", function (msg) {
        let messageSplitArray = msg.toString().split(' ');
        assert.equal(messageSplitArray[0], '<' + (facility*8+severity) + '>1');
        assert.equal(parseFormat(messageSplitArray[1]), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        assert.equal(messageSplitArray[2], hostname);
        assert.equal(messageSplitArray[3], appName);
        assert.equal(messageSplitArray[4], processId);
        assert.equal(messageSplitArray[5], messageId);
        assert.equal(messageSplitArray[6], structuredData);
        assert.equal(messageSplitArray[7], message);
        socket.close(done);
      });

      socket.bind(null, function () {
        let syslogTransporter = new SyslogTransporter({
          errorHandler: errorHandler,
          port: socket.address().port,
          facility: facility,
          hostname: hostname,
          appName: appName,
          processId: processId
        });

        syslogTransporter.write(message, {
          severity: severity,
          messageId: messageId,
          structuredData: structuredData
        }, function (err) {
          assert.ifError(err);
        });
      });
    });

    it('should use debugKey as messageId only on debug severity', function (done) {
      let facility = 10,
          debugKey = 'foobarDebugKey',
          message = 'foobarMsg',
          socket = dgram.createSocket('udp4'),
          debugRequest = false,
          infoRequest = false,
          triedDone = 0;

      socket.on("error", function (err) {
        assert.ifError(err);
        socket.close(done);
      });

      function tryDone(socket) {
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

        if (messageSplitArray[0] === '<' + (facility*8+SHARED_CONSTANTS.SEVERITY.DEBUG) + '>1') {
          assert.equal(messageSplitArray[5], debugKey);
          debugRequest = true;
        } else if (messageSplitArray[0] === '<' + (facility*8+SHARED_CONSTANTS.SEVERITY.INFO) + '>1') {
          assert.equal(messageSplitArray[5], '-');
          infoRequest = true;
        } else {
          assert.fail('this should never happen');
        }

        tryDone(socket);
      });

      socket.bind(null, function () {
        let syslogTransporter = new SyslogTransporter({
          errorHandler: errorHandler,
          port: socket.address().port,
          facility: facility
        });

        syslogTransporter.write(message, {
          severity: SHARED_CONSTANTS.SEVERITY.DEBUG,
          debugKey: debugKey
        }, function (err) {
          assert.ifError(err);
        });

        syslogTransporter.write(message, {
          severity: SHARED_CONSTANTS.SEVERITY.INFO,
          debugKey: debugKey
        }, function (err) {
          assert.ifError(err);
        });
      });
    });

  });
});