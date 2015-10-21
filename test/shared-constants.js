'use strict';

let assert = require('assert');

const SHARED_CONSTANTS = require('../lib/shared-constants');

describe('shared-constants', function () {
  it('should have correct object types', function () {
    assert.equal(SHARED_CONSTANTS.OBJECT_TYPE.BOOLEAN, 'boolean');
    assert.equal(SHARED_CONSTANTS.OBJECT_TYPE.FUNCTION, 'function');
    assert.equal(SHARED_CONSTANTS.OBJECT_TYPE.NUMBER, 'number');
    assert.equal(SHARED_CONSTANTS.OBJECT_TYPE.OBJECT, 'object');
    assert.equal(SHARED_CONSTANTS.OBJECT_TYPE.STRING, 'string');
    assert.equal(SHARED_CONSTANTS.OBJECT_TYPE.UNDEFINED, 'undefined');
  });
});