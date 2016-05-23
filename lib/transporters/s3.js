'use strict';

let Abstract = require('./abstract'),
    AWS = require('aws-sdk'),
    uuid = require('uuid'),
    error = require('../helpers/error'),
    constants = require('../helpers/constants');

const BUCKET_ERROR = 'could not reach bucket';

/**
 * @class Console
 * @extends Abstract
 */
class S3 extends Abstract {

  /**
   * @name S3#s3Config
   * @type object
   */

  /**
   * @name S3#locationPrefix
   * @type string
   */

  /**
   * @inheritdoc
   */
  constructor (config) {
    super(config);

    this.s3Config = {};

    this.setSslEnabled(config)
        .setMaxRetries(config)
        .setAccessKeyId(config)
        .setSecretAccessKey(config)
        .setRegion(config)
        .setAcl(config)
        .setBucket(config)
        .setSessionToken(config)
        .initS3();
  }

  /**
   * @param config
   * @param {string} [config.sessionToken]
   * @returns {S3}
   */
  setSessionToken (config) {
    if (config.hasOwnProperty('sessionToken')) {
      if (typeof config.sessionToken !== constants.TYPE_OF.STRING) {
        throw new Error(error.config.invalidValue('sessionToken'));
      }
      this.s3Config.sessionToken = config.sessionToken;
    }

    return this;
  }

  /**
   * @param config
   * @param {string} [config.ssl]
   * @returns {S3}
   */
  setSslEnabled (config) {
    if (config.hasOwnProperty('ssl')) {
      if (typeof config.ssl !== constants.TYPE_OF.BOOLEAN) {
        throw new Error(error.config.invalidValue('ssl'));
      }
      this.s3Config.sslEnabled = config.ssl;
    }

    return this;
  }

  /**
   * @param config
   * @param {number} [config.maxRetries]
   * @returns {S3}
   */
  setMaxRetries (config) {
    if (config.hasOwnProperty('maxRetries')) {
      if (typeof config.maxRetries !== constants.TYPE_OF.NUMBER) {
        throw new Error(error.config.invalidValue('maxRetries'));
      }
      this.s3Config.maxRetries = config.maxRetries;
    }

    return this;
  }

  /**
   * @param config
   * @param {string} config.accessKeyId
   * @returns {S3}
   */
  setAccessKeyId (config) {
    if (!config.hasOwnProperty('accessKeyId') || typeof config.accessKeyId !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('accessKeyId'));
    }
    this.s3Config.accessKeyId = config.accessKeyId;

    return this;
  }

  /**
   * @param config
   * @param {string} config.secretAccessKey
   * @returns {S3}
   */
  setSecretAccessKey (config) {
    if (!config.hasOwnProperty('secretAccessKey') || typeof config.secretAccessKey !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('secretAccessKey'));
    }
    this.s3Config.secretAccessKey = config.secretAccessKey;

    return this;
  }

  /**
   * @param config
   * @param {string} config.bucket
   * @returns {S3}
   */
  setBucket (config) {
    if (!config.hasOwnProperty('bucket') || typeof config.bucket !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('bucket'));
    }
    this.s3Config.Bucket = config.bucket;

    return this;
  }

  /**
   * @param config
   * @param {string} config.region
   * @returns {S3}
   */
  setRegion (config) {
    if (!config.hasOwnProperty('region') || typeof config.region !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('region'));
    }
    this.s3Config.region = config.region;

    return this;
  }

  /**
   * @param config
   * @param {string} [config.acl]
   * @returns {S3}
   */
  setAcl (config) {
    if (config.hasOwnProperty('acl')) {
      if (typeof config.acl !== constants.TYPE_OF.STRING) {
        throw new Error(error.config.invalidValue('acl'));
      }
      this.s3Config.ACL = config.acl;
    }

    return this;
  }

  /**
   * @returns {S3}
   */
  initS3 () {
    this.s3 = new AWS.S3(this.s3Config);

    //noinspection JSUnresolvedFunction
    this.s3.headBucket({Bucket: this.s3Config.Bucket}, function headBucket (err) {
      if (err) {
        throw new Error(BUCKET_ERROR);
      }
    });

    return this;
  }

  /**
   * @inheritdoc
   */
  write (message, context, severity, callback) {
    let self = this;

    //noinspection JSUnresolvedFunction
    this.s3.upload({
      Bucket: this.s3Config.Bucket,
      Key: uuid.v1({msecs: Date.now(), nsecs: Math.floor(process.hrtime()[1]/100000)}),
      ACL: this.s3Config.ACL,
      Body: message
    },
    function s3Callback (err, data) {
      if (err) {
        return callback(null, err.code);
      }
      //noinspection JSUnresolvedVariable
      callback(null, self.fallbackPrefix + data.Location);
    });
  }
}

module.exports = S3;