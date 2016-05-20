'use strict';

let Abstract = require('../../lib/transporters/abstract'),
    assert = require('assert'),
    AWS = require('aws-sdk-mock'),
    S3 = require('../../lib/transporters/s3'),
    defaultS3;

AWS.mock('S3', 'headBucket', function (params, callback) {
  if (params.Bucket !== 'foobar') {
    return callback('wrong bucket');
  }
  callback();
});

AWS.mock('S3', 'upload', function (params, callback) {
  if (params.Body !== 'foobar') {
    return callback({code: 'wrong body'});
  }
  callback(null, {Location: 'foobarLocation'});
});

defaultS3 = new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', bucket: 'foobar'});

describe('transporter s3', function () {

  describe('constructor', function () {

    it('should extend Abstract', function () {
      assert.ok(defaultS3 instanceof Abstract);
    });

    describe('initS3', function () {

      it('should throw on AWS bucket error', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', bucket: 'invalidBucket'});
        }, null, null);
      });

    });

    describe('sessionToken', function () {

      it('should set no default value', function () {
        assert.equal(defaultS3.s3Config.sessionToken, undefined);
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', sessionToken: 'foobar', bucket: 'foobar'}).s3Config.sessionToken, 'foobar');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', sessionToken: true, bucket: 'foobar'});
        }, null, null);
      });

    });

    describe('sslEnabled', function () {

      it('should set no default value', function () {
        assert.equal(defaultS3.s3Config.sslEnabled, undefined);
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', ssl: true, bucket: 'foobar'}).s3Config.sslEnabled, true);
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', ssl: 'foobar', bucket: 'foobar'});
        }, null, null);
      });

    });

    describe('maxRetries', function () {

      it('should set no default value', function () {
        assert.equal(defaultS3.s3Config.maxRetries, undefined);
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', maxRetries: 12, bucket: 'foobar'}).s3Config.maxRetries, 12);
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', maxRetries: 'foobar', bucket: 'foobar'});
        }, null, null);
      });

    });

    describe('fallbackPrefix', function () {

      it('should set default value', function () {
        assert.equal(defaultS3.fallbackPrefix, '');
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', fallbackPrefix: 'fallbackFoobar', bucket: 'foobar'}).fallbackPrefix, 'fallbackFoobar');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', fallbackPrefix: true, bucket: 'foobar'});
        }, null, null);
      });

    });

    describe('ACL', function () {

      it('should set no default value', function () {
        assert.equal(defaultS3.s3Config.ACL, undefined);
      });

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', acl: 'private', bucket: 'foobar'}).s3Config.ACL, 'private');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobar', acl: true, bucket: 'foobar'});
        }, null, null);
      });

    });

    describe('region', function () {

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'foobartest', bucket: 'foobar'}).s3Config.region, 'foobartest');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', region: true, bucket: 'foobar'});
        }, null, null);
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: 'bar', bucket: 'foobar'});
        }, null, null);
      });

    });

    describe('secretAccessKey', function () {

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', secretAccessKey: 'foobartest', region: 'bar', bucket: 'foobar'}).s3Config.secretAccessKey, 'foobartest');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', secretAccessKey: true, region: 'bar', bucket: 'foobar'});
        }, null, null);
        assert.throws(function () {
          new S3({accessKeyId: 'foo', region: 'bar', bucket: 'foobar'});
        }, null, null);
      });

    });

    describe('accessKeyId', function () {

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foobartest', secretAccessKey: 'bar', region: 'bar', bucket: 'foobar'}).s3Config.accessKeyId, 'foobartest');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: true, secretAccessKey: 'foobar', region: 'bar', bucket: 'foobar'});
        }, null, null);
        assert.throws(function () {
          new S3({secretAccessKey: 'foobar', region: 'bar', bucket: 'foobar'});
        }, null, null);
      });

    });

    describe('bucket', function () {

      it('should set custom value', function () {
        assert.equal(new S3({accessKeyId: 'foo', bucket: 'foobar', region: 'bar', secretAccessKey: 'foobar'}).s3Config.Bucket, 'foobar');
      });

      it('should throw on invalid value', function () {
        assert.throws(function () {
          new S3({accessKeyId: 'foo', bucket: true, region: 'bar', secretAccessKey: 'foobar'});
        }, null, null);
        assert.throws(function () {
          new S3({accessKeyId: 'foo', region: 'bar', bucket: 'foobar'});
        }, null, null);
      });

    });

  });

  describe('write', function () {

    it('should..', function (done) {
      defaultS3.write('foo', 'bar', 0, function (fallbackErr, fallbackMsg) {
        assert.equal(fallbackErr, null);
        assert.equal(fallbackMsg, 'wrong body');
        done();
      });
    });

    it('should.. 2', function (done) {
      defaultS3.write('foobar', 'bar', 0, function (fallbackErr, fallbackMsg) {
        assert.equal(fallbackErr, null);
        assert.equal(fallbackMsg, 'foobarLocation');
        done();
      });
    });

  });

});