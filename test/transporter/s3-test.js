'use strict';

let Abstract = require('../../lib/transporters/abstract'),
    assert = require('assert'),
    constants = require('../../lib/helpers/constants'),
    S3 = require('../../lib/transporters/s3'),
    defaultS3;

S3.skipBucketCheck();
defaultS3 = new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar'});

describe('transporter s3', function () {

  describe('constructor', function () {

    it('should extend Abstract', function () {
      assert.ok(defaultS3 instanceof Abstract);
    });

    describe('sslEnabled', function () {

      it('should set no default value', function () {
        assert.equal(defaultS3.s3Config.sslEnabled, undefined);
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', sslEnabled: true}).s3Config.sslEnabled, true);
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', sslEnabled: 'foobar'});
        }, null, null);
      });

    });

    describe('maxRetries', function () {

      it('should set no default value', function () {
        assert.equal(defaultS3.s3Config.maxRetries, undefined);
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', maxRetries: 12}).s3Config.maxRetries, 12);
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', maxRetries: 'foobar'});
        }, null, null);
      });

    });

    describe('locationPrefix', function () {

      it('should set default value', function () {
        assert.equal(defaultS3.locationPrefix, '');
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', locationPrefix: 'locationFoobar'}).locationPrefix, 'locationFoobar');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', locationPrefix: true});
        }, null, null);
      });

    });

    describe('ACL', function () {

      it('should set no default value', function () {
        assert.equal(defaultS3.s3Config.ACL, undefined);
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', ACL: 'private'}).s3Config.ACL, 'private');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', ACL: true});
        }, null, null);
      });

    });

    describe('region', function () {

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobartest'}).s3Config.region, 'foobartest');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: true});
        }, null, null);
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar'});
        }, null, null);
      });

    });

    describe('secretAccessKey', function () {

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'foobartest', region: 'bar'}).s3Config.secretAccessKey, 'foobartest');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: true, region: 'bar'});
        }, null, null);
        assert.throws(function () {
          new S3({accessKeyId: 'foo', region: 'bar'});
        }, null, null);
      });

    });

    describe('accessKeyId', function () {

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foobartest', secretAccessKey: 'bar', region: 'bar'}).s3Config.accessKeyId, 'foobartest');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: true, secretAccessKey: 'foobar', region: 'bar'});
        }, null, null);
        assert.throws(function () {
          new S3({secretAccessKey: 'foobar', region: 'bar'});
        }, null, null);
      });

    });

  });

  describe('write', function () {
    
  });

});