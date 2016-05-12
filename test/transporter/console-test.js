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
        }, null, null);
      });

    });

  });

  describe('log', function () {

    it('should log without color', function (done) {
      let consoleTransporter = new Console({colors: false, prependContext: true}),
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
      let consoleTransporter = new Console({colors: true, prependContext: true}),
          stdOut = process.stdout.write,
          testChalk = new chalk.constructor({enabled: true}),
          tests = [
            {
              context: 'logWithColor0',
              color: 'green',
              index: 1
            },
            {
              context: 'logWithColor1',
              color: 'blue',
              index: 2
            },
            {
              context: 'logWithColor0',
              color: 'green',
              index: 2
            },
            {
              context: 'logWithColor1',
              color: 'blue',
              index: 2
            },
            {
              context: 'logWithColor2',
              color: 'magenta',
              index: 3
            },
            {
              context: 'logWithColor3',
              color: 'cyan',
              index: 4
            },
            {
              context: 'logWithColor4',
              color: 'yellow',
              index: 5
            },
            {
              context: 'logWithColor5',
              color: 'red',
              index: 6
            },
            {
              context: 'logWithColor6',
              color: 'bgRed',
              index: 7
            },
            {
              context: 'logWithColor7',
              color: 'bgGreen',
              index: 8
            },
            {
              context: 'logWithColor8',
              color: 'bgYellow',
              index: 9
            },
            {
              context: 'logWithColor9',
              color: 'bgBlue',
              index: 10
            },
            {
              context: 'logWithColor10',
              color: 'bgMagenta',
              index: 11
            },
            {
              context: 'logWithColor11',
              color: 'bgCyan',
              index: 0
            },
            {
              context: 'logWithColor12',
              color: 'green',
              index: 1
            },
            {
              context: 'logWithColor13',
              color: 'blue',
              severity: 7,
              index: 2
            },
            {
              context: 'logWithColor13',
              color: 'blue',
              index: 2
            }
          ];

      function test (t) {
        process.stdout.write = function (message) {
          if (message.split(' ')[0] === testChalk[tests[t].color](tests[t].context)) {
            assert.equal(message, testChalk[tests[t].color](tests[t].context) + ' foobar\n');
            assert.equal(consoleTransporter.textColorIndex, tests[t].index);

            if (t >= tests.length-1) {
              process.stdout.write = stdOut;
              return done();
            }
            test(t+1);
          } else {
            stdOut.apply(this, arguments);
          }
        };

        consoleTransporter.log('foobar', 5, tests[t].context, function () {});
      }
      test(0);
    });

  });

});