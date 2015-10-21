'use strict';

let stringify = require('../lib/stringify'),
    assert = require('assert');

describe('stringify', function () {

  function testFunction () {}

  let tests = [
    ['should leave string untouched', 'foobar', 'foobar'],
    ['should convert number to string', 22, '22'],
    ['should convert boolean to string', true, 'true'],
    ['should convert undefined to string', undefined, 'undefined'],
    ['should convert null to string', null, 'null'],
    ['should convert function to string', testFunction, "function testFunction() {}"],
    ['should convert object to string', {foo: 'bar'}, JSON.stringify({foo: 'bar'})]
  ];

  tests.forEach(function (test) {
    it(test[0], function () {
      let stringifyResult = stringify(test[1]);

      assert.equal(stringifyResult, test[2]);
      assert.equal(typeof stringifyResult, 'string');
    });
  });

  it('should convert error to string', function () {
    let error = new Error('foobar'),
        errorString = stringify(error);

    assert.equal(JSON.parse(errorString).message, error.message);
    assert.equal(JSON.parse(errorString).stack, error.stack);
  });

  it('should convert error to string when error occurs during object conversion', function () {
    let obj = {a: 'foo'},
        stringifyError;
    obj.b = obj;

    stringifyError = JSON.parse(stringify(obj));

    try {
      JSON.stringify(obj);
      assert.fail('this should not happen');
    } catch (err) {
      assert.equal(stringifyError.message, err.message);
    }
  });

});