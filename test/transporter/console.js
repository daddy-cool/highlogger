'use strict';

let AbstractTransporter = require('../../lib/transporter/abstract'),
    ConsoleTransporter = require('../../lib/transporter/console'),
    assert = require('assert'),
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
    it('should write to output on severity >= NOTICE', function (done) {
      let doneCount = 0,
          doneWait = function (next) {
            doneCount++;
            if (doneCount === 3) {
              return done();
            }

            next();
          },
          message = 'foobar',
          writableOutputStream = new stream.Writable({
            write: function (chunk, encoding, next) {
              assert.equal(chunk.toString(), message + '\n');
              doneWait(next);
            }
          }),
          writableErrorStream = new stream.Writable({
            write: function (chunk, encoding, next) {
              next();
            }
          }),
          consoleTransporter = new ConsoleTransporter({
            errorHandler: errorHandler,
            streams: {
              output: writableOutputStream,
              error: writableErrorStream
            }
          }),
          errorCallback = function (err) {
            assert.ifError(err);
          };

      for (let s in SHARED_CONSTANTS.SEVERITY) {
        if (SHARED_CONSTANTS.SEVERITY.hasOwnProperty(s)) {
          consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY[s]}, errorCallback);
        }
      }
    });

    it('should write to error on severity <= WARNING', function (done) {
      let doneCount = 0,
          doneWait = function (next) {
            doneCount++;
            if (doneCount === 5) {
              return done();
            }

            next();
          },
          message = 'foobar',
          writableOutputStream = new stream.Writable({
            write: function (chunk, encoding, next) {
              next();
            }
          }),
          writableErrorStream = new stream.Writable({
            write: function (chunk, encoding, next) {
              assert.equal(chunk.toString(), message + '\n');
              doneWait(next);
            }
          }),
          consoleTransporter,
          errorCallback = function (err) {
            assert.ifError(err);
          };

      consoleTransporter = new ConsoleTransporter({
        errorHandler: errorHandler,
        streams: {
          output: writableOutputStream,
          error: writableErrorStream
        }
      });

      for (let s in SHARED_CONSTANTS.SEVERITY) {
        if (SHARED_CONSTANTS.SEVERITY.hasOwnProperty(s)) {
          consoleTransporter.write(message, {severity: SHARED_CONSTANTS.SEVERITY[s]}, errorCallback);
        }
      }
    });
  });
});