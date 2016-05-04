'use strict';
let Debug = require('../lib/debug'),
    assert = require('assert');

describe('debug', function () {
  it('should set default debugKeys', function () {
    let debug = new Debug();
    assert.deepEqual(debug.included, []);
    assert.deepEqual(debug.excluded, []);
  });

  it('should not set invalid debugKeys', function () {
    let debugEnv = process.env.DEBUG,
        debug, debug2, debug3, debug4;

    process.env.DEBUG = '';
    debug = new Debug();

    delete process.env.DEBUG;
    debug2 = new Debug();

    process.env.DEBUG = 'a, c, -b, -d';
    debug3 = new Debug();

    process.env.DEBUG = '*,   ';
    debug4 = new Debug();

    assert.deepEqual(debug.included, []);
    assert.deepEqual(debug.excluded, []);
    assert.deepEqual(debug2.included, []);
    assert.deepEqual(debug2.excluded, []);
    assert.deepEqual(debug3.included, [new RegExp('^c$'), new RegExp('^a$')]);
    assert.deepEqual(debug3.excluded, [new RegExp('^d$'), new RegExp('^b$')]);
    assert.deepEqual(debug4.included, [/^.*$/]);
    assert.deepEqual(debug4.excluded, []);

    process.env.DEBUG = debugEnv;
  });
});