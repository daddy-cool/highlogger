'use strict';

let Stringify = require('../lib/stringify'),
    stringify = new Stringify({}),
    fs = require('fs'),
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
      let stringifyResult = stringify.stringify(test[1], false, Infinity);

      assert.equal(stringifyResult, test[2]);
      assert.equal(typeof stringifyResult, 'string');
    });
  });

  it('should convert error to string', function () {
    let error = new Error('foobar'),
        errorString;
    error.customValue = 'foobar';

    errorString = stringify.stringify(error, false, Infinity);

    assert.equal(JSON.parse(errorString).message, error.message);
    assert.equal(JSON.parse(errorString).stack, error.stack);
    assert.equal(JSON.parse(errorString).customValue, 'foobar');
  });

  it('should detect circular JSON and replace references with ~', function () {
    let obj = {a: 'foo'};
    obj.b = obj;

    assert.equal(stringify.stringify(obj, false, Infinity), '{"a":"foo","b":"~"}');
  });

  it('should stringify arrays as object when json=true and just stringify otherwise', function () {
    let arr = ['1', 'a', 'c'];

    assert.equal(stringify.stringify(arr, true, Infinity), '{"0":"1","1":"a","2":"c"}');
    assert.equal(stringify.stringify(arr, false, Infinity), '["1","a","c"]');
  });

  it('should shorten message if exceeding limit', function () {
    assert.equal(stringify.stringify('foobar', true, 17), '{"message":"foo"}');
    assert.equal(stringify.stringify('foobar', false, 3), 'foo');
    assert.equal(stringify.stringify({0:{foo:"bar"}, 1:{bar:"foo"}}, true, 37), '{"0":{"foo":"bar"},"1":{"bar":"foo"}}');
    assert.equal(stringify.stringify({0:{foo:"bar"}, 1:{bar:"foo"}}, true, 35), '{\"message\":\"{\\\"0\\\":{\\\"foo\\\":\\\"bar\"}');
  });

  it('should return an empty object if maxlength is set to zero', function () {
    assert.equal(stringify.stringify('foobar', true, 0), "{\"message\":\"\"}");
  });

  it('should return with custom default field if json is set to true', function () {
    let stringify2 = new Stringify({jsonDefaultField: 'foo'});

    assert.equal(stringify2.stringify('bar', true, 13), "{\"foo\":\"bar\"}");
  });

  it('should return a timeout message after certain time has passed', function () {
    let timeout = 500,
        stringify2 = new Stringify({jsonTimeout: timeout});
    assert.equal(stringify2.stringify('foobar', true, 1), "{\"message\":\"stringify timeout after " + timeout + "ms\"}");
  });

  it('should not take longer than the timeout to cut a very long message with wrapping as JSON', function (done) {
    fs.readFile('./test/big-file.json', 'utf8', function (err, file) {
      assert.equal(err, null, 'could not read big-file.json');

      assert.equal(stringify.stringify(
        JSON.parse(file), true, 34),
        "{\"message\":\"{\\\"0\\\":{\\\"_id\\\":\\\"56\"}",
        'timeout or response malformed'
      );
      done();
    });
  });
});