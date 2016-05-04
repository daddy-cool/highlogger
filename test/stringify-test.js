'use strict';

let stringify = require('../lib/helpers/stringify'),
    fs = require('fs'),
    assert = require('assert');

describe('stringify', function () {

  function testFunction () {}

  let tests = [
    ['should leave string untouched', 'context0', 'foobar', 'foobar'],
    ['should convert number to string', 'context1', 22, '22'],
    ['should convert boolean to string', 'context2', true, 'true'],
    ['should convert undefined to string', 'context3', undefined, 'undefined'],
    ['should convert null to string', 'context4', null, 'null'],
    ['should convert function to string', 'context5', testFunction, "function testFunction() {}"],
    ['should convert object to string', 'context6', {foo: 'bar'}, "{ foo: 'bar' }"]
  ];

  tests.forEach(function (test) {
    it(test[0], function (done) {
      stringify(test[1], test[2], false, function (stringifyResult) {
        assert.equal(stringifyResult, test[1] + ' ' + test[3]);
        assert.equal(typeof stringifyResult, 'string');
        done();
      });
    });
  });

  it('should convert error to string', function (done) {
    let error = new Error('foobar');
    error.customValue = 'foobar';

    stringify('context', error, true, function (errorString) {
      let errorObj = JSON.parse(errorString);
      assert.equal(errorObj.message, error.message);
      assert.equal(errorObj.stack, error.stack);
      assert.equal(errorObj.customValue, 'foobar');
      done();
    });
  });

  it('should detect circular JSON and replace references with ~', function (done) {
    let obj = [{a: 'foo'}],
        doneCalls = 0;
    obj[1] = obj;

    function isDone () {
      if (doneCalls++ === 1) {
        done();
      }
    }

    stringify('context', obj, true, function (stringified) {
      assert.equal(stringified, "{\"0\":{\"a\":\"foo\"},\"1\":[\"~0\",\"~1\"],\"context\":\"context\"}");
      isDone();
    });

    stringify('context', obj, false, function (stringified) {
      assert.equal(stringified, "context [ { a: 'foo' }, [Circular] ]");
      isDone();
    });
  });
});