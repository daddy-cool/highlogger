"use strict";

let assert = require('assert'),
    Abstract = require('../lib/transporters/abstract'),
    Transporters = require('../lib/transporters');

describe('transporters', function () {
  it('should set fallback', function () {
    let transporters = new Transporters([{type: 'console', fallback: {type: 'console'}}]);
    assert.equal(transporters.transporterList.length, 1);
    assert.ok(transporters.transporterList[0] instanceof Abstract);
    assert.ok(transporters.transporterList[0].fallbackTransporter instanceof Abstract);
  });

});