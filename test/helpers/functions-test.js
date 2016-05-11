'use strict';

let assert = require('assert'),
    functions = require('../../lib/helpers/functions');

describe('functions', function () {

  describe('filterPrintUsASCII', function () {

    it('should filter to PRINT US ASCII and shorten to given maxSize', function () {
      let tests = [
        ['a', 1, 'a'],
        ['aa', 1, 'a'],
        [123, 2, '12'],
        [true, 2, 'tr'],
        [false, 22, 'false'],
        ['', 99, '-'],
        [null, 99, '-'],
        [{}, 99, '-'],
        [NaN, 99, 'NaN'],
        [Infinity, 2, 'In'],
        ['öäüß', 22, '-'],
        ['öäüß,.-#+^´`?=)(/&%$§"!@<>|', 99, ',.-#+^`?=)(/&%$"!@<>|'],
        ['foo bar', 6, 'foobar']
      ];
      tests.forEach(function (test) {
        assert.equal(functions.filterPrintUsASCII(test[0], test[1]), test[2]);
      });
    });

  });

});