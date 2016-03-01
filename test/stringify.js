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
      let stringifyResult = stringify(test[1], false, Infinity);

      assert.equal(stringifyResult, test[2]);
      assert.equal(typeof stringifyResult, 'string');
    });
  });

  it('should convert error to string', function () {
    let error = new Error('foobar'),
        errorString;
    error.customValue = 'foobar';

    errorString = stringify(error, false, Infinity);

    assert.equal(JSON.parse(errorString).message, error.message);
    assert.equal(JSON.parse(errorString).stack, error.stack);
    assert.equal(JSON.parse(errorString).customValue, 'foobar');
  });

  it('should detect circular JSON and replace references with ~', function () {
    let obj = {a: 'foo'};
    obj.b = obj;

    assert.equal(stringify(obj, false, Infinity), '{"a":"foo","b":"~"}');
  });

  it('should stringify arrays as object when json=true and just stringify otherwise', function () {
    let arr = ['1', 'a', 'c'];

    assert.equal(stringify(arr, true, Infinity), '{"0":"1","1":"a","2":"c"}');
    assert.equal(stringify(arr, false, Infinity), '["1","a","c"]');
  });

  it('should shorten message if exceeding limit', function () {
    assert.equal(stringify('foobar', true, 13), '{"msg":"foo"}');
    assert.equal(stringify('foobar', false, 3), 'foo');
    assert.equal(stringify({0:{foo:"bar"}, 1:{bar:"foo"}}, true, 37), '{"0":{"foo":"bar"},"1":{"bar":"foo"}}');
    assert.equal(stringify({0:{foo:"bar"}, 1:{bar:"foo"}}, true, 31), '{\"msg\":\"{\\\"0\\\":{\\\"foo\\\":\\\"bar\"}');
  });

  it('should return a timeout message after certain time has passed', function () {
    assert.equal(stringify('foobar', true, 0), "{\"msg\":\"stringify timeout after 100ms\"}");
  });

});