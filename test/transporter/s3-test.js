'use strict';

let Abstract = require('../../lib/transporters/abstract'),
    S3 = require('../../lib/transporters/s3'),
    assert = require('assert'),
    defaultS3 = new S3({});

describe('transporter s3', function () {

  describe('constructor', function () {

    it('should extend Abstract', function () {
      assert.ok(defaultS3 instanceof Abstract);
    });

  });

});