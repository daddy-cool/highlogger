'use strict';

let Abstract = require('./abstract'),
    AWS = require('aws-sdk'),
    crypto = require('crypto'),
    error = require('../helpers/error'),
    constants = require('../helpers/constants'),
    skipBucketCheck = false;

const UNDERSCORE = '_';
const EMPTY = '';
const BUCKET_ERROR = 'could not reach bucket';

/**
 * @class Console
 * @extends Abstract
 */
class S3 extends Abstract {

  static skipBucketCheck () {
    skipBucketCheck = true;
  }

  /**
   * @inheritdoc
   */
  constructor (config) {
    super(config);

    this.s3Config = {};

    this.setSslEnabled(config)
        .setMaxRetries(config)
        .setLocationPrefix(config)
        .setAccessKeyId(config)
        .setSecretAccessKey(config)
        .setRegion(config)
        .setAcl(config)
        .initS3(config);
  }

  setSslEnabled (config) {
    if (config.hasOwnProperty('sslEnabled')) {
      if (typeof config.sslEnabled !== constants.TYPE_OF.BOOLEAN) {
        throw new Error(error.config.invalidValue('sslEnabled'));
      }
      this.s3Config.sslEnabled = config.sslEnabled;
    }

    return this;
  }

  setMaxRetries (config) {
    if (config.hasOwnProperty('maxRetries')) {
      if (typeof config.maxRetries !== constants.TYPE_OF.NUMBER) {
        throw new Error(error.config.invalidValue('maxRetries'));
      }
      this.s3Config.maxRetries = config.maxRetries;
    }

    return this;
  }

  setAccessKeyId (config) {
    if (!config.hasOwnProperty('accessKeyId') || typeof config.accessKeyId !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('accessKeyId'));
    }
    this.s3Config.accessKeyId = config.accessKeyId;

    return this;
  }

  setSecretAccessKey (config) {
    if (!config.hasOwnProperty('secretAccessKey') || typeof config.secretAccessKey !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('secretAccessKey'));
    }
    this.s3Config.secretAccessKey = config.secretAccessKey;

    return this;
  }

  setRegion (config) {
    if (!config.hasOwnProperty('region') || typeof config.region !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('region'));
    }
    this.s3Config.region = config.region;

    return this;
  }

  setAcl (config) {
    if (config.hasOwnProperty('ACL')) {
      if (typeof config.ACL !== constants.TYPE_OF.STRING) {
        throw new Error(error.config.invalidValue('ACL'));
      }
      this.s3Config.ACL = config.ACL;
    }

    return this;
  }

  setLocationPrefix (config) {
    this.locationPrefix = '';
    if (config.hasOwnProperty('locationPrefix')) {
      if (typeof config.locationPrefix !== constants.TYPE_OF.STRING) {
        throw new Error(error.config.invalidValue('locationPrefix'));
      }
      this.locationPrefix = config.locationPrefix;
    }

    return this;
  }

  initS3 (config) {
    /* istanbul ignore next */
    config.logger = function awsLog () {};
    this.s3 = new AWS.S3(this.s3Config);

    /* istanbul ignore if */
    if (!skipBucketCheck) {
      //noinspection JSUnresolvedFunction
      this.s3.headBucket({Bucket: this.s3Config.Bucket}, function headBucket (err) {
        if (err) {
          throw new Error(BUCKET_ERROR);
        }
      });
    }

    return this;
  }

  /**
   * @inheritdoc
   */
  write (message, context, severity, callback) {
    let self = this,
        hrTime = process.hrtime(),
        random = crypto.createHash('md5').update(EMPTY + hrTime[0] + hrTime[1] + Math.random()).digest('hex');

    //noinspection JSUnresolvedFunction
    this.s3.upload(
      {
        Bucket: this.s3Config.Bucket,
        Key: severity + UNDERSCORE + context + UNDERSCORE + random,
        ACL: this.ACL,
        Body: message
      },
      function s3Callback (err, data) {
        if (err) {
          return callback(null, err.code);
        }
        callback(null, self.locationPrefix + data.Location);
      }
    );
  }
}

module.exports = S3;