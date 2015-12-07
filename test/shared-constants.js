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

  it('should have correct severities', function () {
    assert.equal(SHARED_CONSTANTS.SEVERITY.emerg, 0);
    assert.equal(SHARED_CONSTANTS.SEVERITY.alert, 1);
    assert.equal(SHARED_CONSTANTS.SEVERITY.crit, 2);
    assert.equal(SHARED_CONSTANTS.SEVERITY.error, 3);
    assert.equal(SHARED_CONSTANTS.SEVERITY.warn, 4);
    assert.equal(SHARED_CONSTANTS.SEVERITY.notice, 5);
    assert.equal(SHARED_CONSTANTS.SEVERITY.info, 6);
    assert.equal(SHARED_CONSTANTS.SEVERITY.debug, 7);
  });
});