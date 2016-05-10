'use strict';

let Abstract = require('../../lib/transporters/abstract'),
    Console = require('../../lib/transporters/console'),
    assert = require('assert'),
    chalk = require('chalk'),
    defaultConsole = new Console({});

describe('transporter console', function () {

  describe('constructor', function () {

    it('should extend Abstract', function () {
      assert.ok(defaultConsole instanceof Abstract);
    });

    describe('colors', function () {

      it('should set default colors', function () {
        assert.equal(defaultConsole.chalk.enabled, chalk.supportsColor);
      });

      it('should set custom colors', function () {
        assert.equal(new Console({colors: true}).chalk.enabled, true);
        assert.equal(new Console({colors: false}).chalk.enabled, false);
      });

      it('should throw on invalid colors', function () {
        assert.throws(function () {
          new Console({colors: 'foo'});
        });
      });

    });

  });

  describe('log', function () {

    it('should log without color', function (done) {
      let consoleTransporter = new Console({colors: false}),
          stdOut = process.stdout.write,
          stdErr = process.stderr.write,
          doneCount = 0,
          isDone = function () {
            if (doneCount++ >= 1) {
              return done();
            }
          };

      process.stdout.write = function (message) {
        if (message.split(' ')[0] === 'logWithoutColor') {
          assert.equal(message, 'logWithoutColor foo5bar\n');
          isDone();
        } else {
          stdOut.apply(this, arguments);
        }
      };

      process.stderr.write = function (message) {
        if (message.split(' ')[0] === 'logWithoutColor') {
          assert.equal(message, 'logWithoutColor foo0bar\n');
          isDone();
        } else {
          stdErr.apply(this, arguments);
        }
      };

      consoleTransporter.log('foo5bar', 5, 'logWithoutColor', function () {
        process.stdout.write = stdOut;
      });
      consoleTransporter.log('foo0bar', 0, 'logWithoutColor', function () {
        process.stderr.write = stdErr;
      });
    });

    it('should log with color', function (done) {
      let tests = [
        {
          context: 'logWithColor0',
          color: 'green',
          severity: 0
        },
        {
          context: 'logWithColor1',
          color: 'blue',
          severity: 1
        },
        {
          context: 'logWithColor0',
          color: 'green',
          severity: 2
        },
        {
          context: 'logWithColor1',
          color: 'blue',
          severity: 3
        },
        {
          context: 'logWithColor2',
          color: 'magenta',
          severity: 4
        },
        {
          context: 'logWithColor3',
          color: 'cyan',
          severity: 5
        },
        {
          context: 'logWithColor4',
          color: 'yellow',
          severity: 6
        },
        {
          context: 'logWithColor5',
          color: 'red',
          severity: 7
        },
        {
          context: 'logWithColor6',
          color: 'bgRed',
          severity: 0
        },
        {
          context: 'logWithColor7',
          color: 'bgGreen',
          severity: 1
        },
        {
          context: 'logWithColor8',
          color: 'bgYellow',
          severity: 2
        },
        {
          context: 'logWithColor9',
          color: 'bgBlue',
          severity: 3
        },
        {
          context: 'logWithColor10',
          color: 'bgMagenta',
          severity: 4
        },
        {
          context: 'logWithColor11',
          color: 'bgCyan',
          severity: 5
        },
        {
          context: 'logWithColor12',
          color: 'green',
          severity: 6
        },
        {
          context: 'logWithColor13',
          color: 'blue',
          severity: 7
        },
        {
          context: 'logWithColor13',
          color: 'blue',
          severity: 0
        }
          ],
          testChalk = new chalk.constructor({enabled: true}),
          consoleTransporter = new Console({colors: true}),
          doneCount = 0,
          isDone = function () {
            if (doneCount++ >= tests.length-1) {
              return done();
            }
          };

      tests.forEach(function (test) {
        consoleTransporter.write = function (msg, severity) {
          let msgArray = msg.split(' ');
          assert.equal(msgArray[0], testChalk[test.color](test.context));
          assert.equal(severity, test.severity);
          assert.equal(msgArray[1], 'foobar');
          isDone();
        };

        consoleTransporter.log('foobar', test.severity, test.context, null);
      });

    });

  });

});