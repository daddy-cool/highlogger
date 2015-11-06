'use strict';

let AbstractTransporter = require('../../lib/transporter/abstract'),
    ConsoleTransporter = require('../../lib/transporter/console'),
    assert = require('assert'),
    chalk = new (require('chalk')).constructor({enabled: true}),
    stream = require('stream');

const SHARED_CONSTANTS = require('../../lib/shared-constants');

function errorHandler (err) {
  assert.ifError(err);
}

describe('transporter console', function () {
  it('should inherit from AbstractTransporter', function () {
    let consoleTransporter = new ConsoleTransporter({errorHandler: errorHandler});

    assert.ok(consoleTransporter instanceof AbstractTransporter);
  });

  describe('write', function () {
    it('should write any severity to output without colors', function (done) {
      let message = 'foobar',
          doneCounter = 0,
          doneWait = function doneW (next) {
            doneCounter++;
            if (doneCounter === 3) {
              return done();
            }
            next();
          },
          writableOutputStream = new stream.Writable({
            write: function (chunk, encoding, next) {
              assert.equal(chunk.toString(), message + '\n');
              doneWait(next);
            }
          }),
          consoleTransporter = new ConsoleTransporter({
            errorHandler: errorHandler,
            stream: writableOutputStream,
            colors: false
          }),
          errorCallback = function (err) {
            assert.ifError(err);
          };

      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.ERROR}, errorCallback);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.WARN}, errorCallback);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.NOTICE}, errorCallback);
    });

    it('should write emerg/crit/error severity to output with red color', function (done) {
      let message = 'foobar',
          doneCounter = 0,
          doneWait = function doneW (next) {
            doneCounter++;
            if (doneCounter === 3) {
              return done();
            }
            next();
          },
          writableOutputStream = new stream.Writable({
            write: function (chunk, encoding, next) {
              assert.equal(chunk.toString(), '\u001b[31m' + message + '\u001b[39m\n');
              doneWait(next);
            }
          }),
          consoleTransporter = new ConsoleTransporter({
            errorHandler: errorHandler,
            stream: writableOutputStream,
            colors: true
          }),
          errorCallback = function (err) {
            assert.ifError(err);
          };

      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.EMERG}, errorCallback);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.CRIT}, errorCallback);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.ERROR}, errorCallback);
    });

    it('should write warning severity to output with yellow color', function (done) {
      let message = 'foobar',
          writableOutputStream = new stream.Writable({
            write: function (chunk) {
              assert.equal(chunk.toString(), '\u001b[33m' + message + '\u001b[39m\n');
              done();
            }
          }),
          consoleTransporter = new ConsoleTransporter({
            errorHandler: errorHandler,
            stream: writableOutputStream,
            colors: true
          }),
          errorCallback = function (err) {
            assert.ifError(err);
          };

      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.WARN}, errorCallback);
    });

    it('should write notice/info/debug severity to output without color', function (done) {
      let message = 'foobar',
          doneCounter = 0,
          doneWait = function doneW (next) {
            doneCounter++;
            if (doneCounter === 3) {
              return done();
            }
            next();
          },
          writableOutputStream = new stream.Writable({
            write: function (chunk, encoding, next) {
              assert.equal(chunk.toString(), message + '\n');
              doneWait(next);
            }
          }),
          consoleTransporter = new ConsoleTransporter({
            errorHandler: errorHandler,
            stream: writableOutputStream,
            colors: true
          }),
          errorCallback = function (err) {
            assert.ifError(err);
          };

      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.NOTICE}, errorCallback);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.INFO}, errorCallback);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.DEBUG}, errorCallback);
    });

    describe('debug', function () {
      it('should prepend debubKey on severity debug', function (done) {
        let message = 'foobarMessage',
            debugKey = 'foobarDebugKey',
            writableOutputStream = new stream.Writable({
              write: function (chunk) {
                assert.equal(chunk.toString(), debugKey + ' ' + message + '\n');
                done();
              }
            }),
            consoleTransporter = new ConsoleTransporter({
              errorHandler: errorHandler,
              stream: writableOutputStream,
              colors: false
            }),
            errorCallback = function (err) {
              assert.ifError(err);
            };

        consoleTransporter.write(message, {
          debugKey: debugKey,
          severity: SHARED_CONSTANTS.SEVERITY.DEBUG
        }, errorCallback);
      });

      it('should not prepend debugKey on any severity that is not debug', function (done) {
        let message = 'foobarMessage',
            debugKey = 'foobarDebugKey',
            writableOutputStream = new stream.Writable({
              write: function (chunk) {
                assert.equal(chunk.toString(), message + '\n');
                done();
              }
            }),
            consoleTransporter = new ConsoleTransporter({
              errorHandler: errorHandler,
              stream: writableOutputStream,
              colors: false
            }),
            errorCallback = function (err) {
              assert.ifError(err);
            };

        consoleTransporter.write(message, {
          debugKey: debugKey,
          severity: SHARED_CONSTANTS.SEVERITY.INFO
        }, errorCallback);
      });

      it('should remember color for each debugKey', function (done) {
        let tests = {
              msg1: {
                key: 'debugKey1',
                color: 'green'
              },
              msg2: {
                key: 'debugKey2',
                color: 'blue'
              },
              msg3: {
                key: 'debugKey3',
                color: 'magenta'
              },
              msg4: {
                key: 'debugKey4',
                color: 'cyan'
              },
              msg5: {
                key: 'debugKey5',
                color: 'green'
              }
            },
            doneCounter = 0,
            writableOutputStream = new stream.Writable({
              write: function (chunk, encoding, next) {
                let msg = chunk.toString().split(' '),
                    testKey = msg[1].trim();

                if (typeof tests[testKey] === 'undefined') {
                  assert.fail('this should never happen');
                  return done();
                }

                assert.equal(msg[0], chalk[tests[testKey].color](tests[testKey].key));

                doneCounter++;
                if (doneCounter === 10) {
                  return done();
                }
                next();
              }
            }),
            consoleTransporter = new ConsoleTransporter({
              errorHandler: errorHandler,
              stream: writableOutputStream,
              colors: true
            }),
            errorCallback = function (err) {
              assert.ifError(err);
            };

        for (let t in tests) {
          consoleTransporter.write(t, {
            debugKey: tests[t].key,
            severity: SHARED_CONSTANTS.SEVERITY.DEBUG
          }, errorCallback);
        }

        for (let t in tests) {
          consoleTransporter.write(t, {
            debugKey: tests[t].key,
            severity: SHARED_CONSTANTS.SEVERITY.DEBUG
          }, errorCallback);
        }
      });
    });
  });
});