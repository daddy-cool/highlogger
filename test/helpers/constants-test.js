'use strict';

let assert = require('assert'),
    constants = require('../../lib/helpers/constants');

describe('constants', function () {

  it('should have correct object types', function () {
    assert.equal(constants.TYPE_OF.BOOLEAN, 'boolean');
    assert.equal(constants.TYPE_OF.FUNCTION, 'function');
    assert.equal(constants.TYPE_OF.NUMBER, 'number');
    assert.equal(constants.TYPE_OF.OBJECT, 'object');
    assert.equal(constants.TYPE_OF.STRING, 'string');
    assert.equal(constants.TYPE_OF.UNDEFINED, 'undefined');
    assert.equal(constants.TYPE_OF.SYMBOL, 'symbol');
  });

  it('should have correct severities', function () {
    assert.equal(constants.SEVERITY.emerg, 0);
    assert.equal(constants.SEVERITY.alert, 1);
    assert.equal(constants.SEVERITY.crit, 2);
    assert.equal(constants.SEVERITY.error, 3);
    assert.equal(constants.SEVERITY.warn, 4);
    assert.equal(constants.SEVERITY.notice, 5);
    assert.equal(constants.SEVERITY.info, 6);
    assert.equal(constants.SEVERITY.debug, 7);
  });
  
});