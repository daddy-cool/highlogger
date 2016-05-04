'use strict';

let AbstractTransporter = require('../../lib/transporters/abstract'),
    ConsoleTransporter = require('../../lib/transporters/console'),
    assert = require('assert'),
    chalk = new (require('chalk')).constructor({enabled: true}),
    stream = require('stream');

const SHARED_CONSTANTS = require('../../lib/helpers/constants');

describe('transporter console', function () {
  it('should inherit from AbstractTransporter', function () {
    let consoleTransporter = new ConsoleTransporter({});

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
            stream: writableOutputStream,
            colors: false
          }),
          cb = function () {};

      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.error}, cb);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.warn}, cb);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.notice}, cb);
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
            stream: writableOutputStream,
            colors: true
          }),
          cb = function () {};

      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.emerg}, cb);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.crit}, cb);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.error}, cb);
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
            stream: writableOutputStream,
            colors: true
          });

      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.warn}, function () {});
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
            stream: writableOutputStream,
            colors: true
          }),
          cb = function () {};

      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.notice}, cb);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.info}, cb);
      consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY.debug}, cb);
    });

    describe('debug', function () {
      it('should prepend context', function (done) {
        let message = 'foobarMessage',
            debugKey = 'foobarDebugKey',
            writableOutputStream = new stream.Writable({
              write: function (chunk) {
                assert.equal(chunk.toString(), debugKey + ' ' + message + '\n');
                done();
              }
            }),
            consoleTransporter = new ConsoleTransporter({
              stdout: writableOutputStream,
              colors: false
            });

        consoleTransporter.write([message], SHARED_CONSTANTS.SEVERITY.debug, debugKey, function () {});
      });

      it('should remember color for each context', function (done) {
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
              stream: writableOutputStream,
              colors: true
            }),
            cb = function () {};

        for (let t in tests) {
          consoleTransporter.write(t, {
            debugKey: tests[t].key,
            severity: SHARED_CONSTANTS.SEVERITY.debug
          }, cb);
        }

        for (let t in tests) {
          consoleTransporter.write(t, {
            debugKey: tests[t].key,
            severity: SHARED_CONSTANTS.SEVERITY.debug
          }, cb);
        }
      });
    });
  });
});