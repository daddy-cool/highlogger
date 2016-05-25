'use strict';

let Abstract = require('./abstract'),
    AWS = require('aws-sdk'),
    uuid = require('uuid'),
    error = require('../helpers/error'),
    path = require('path'),
    constants = require('../helpers/constants');

const BUCKET_ERROR = 'could not reach bucket';

/**
 * @class Console
 * @extends Abstract
 */
class S3 extends Abstract {

  /**
   * @inheritdoc
   */
  constructor (config) {
    super(config);

    /**
     * @type {string}
     */
    this.appName = null;

    /**
     * @type {boolean}
     */
    this.s3UseContext = this.useContext;

    /**
     * @type {boolean}
     */
    this.useContext = false;

    /**
     * @type {object}
     */
    this.s3Config = {};

    this.setAppName()
        .setSslEnabled()
        .setMaxRetries()
        .setAccessKeyId()
        .setSecretAccessKey()
        .setRegion()
        .setAcl()
        .setBucket()
        .setSessionToken();

    /**
     * @type {AWS.S3}
     * @throws {Error}
     */
    this.s3 = new AWS.S3(this.s3Config);

    //noinspection JSUnresolvedFunction
    this.s3.headBucket({Bucket: this.s3Config.Bucket}, function headBucket (err) {
      if (err) {
        throw new Error(BUCKET_ERROR);
      }
    });
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setAppName () {
    if (this.config.hasOwnProperty('appName')) {
      if (typeof this.config.appName !== constants.TYPE_OF.STRING) {
        throw new TypeError(error.config.invalidValue('appName'));
      }
      this.appName = this.config.appName;
    } else {
      let appDir = path.dirname(require.main.filename),
          packageJson = path.join(appDir, 'package.json');

      try {
        this.appName = require(packageJson).name.split('/').pop();
      } catch (e) {
        //do nothing
      }
    }

    return this;
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setSessionToken () {
    if (this.config.hasOwnProperty('sessionToken')) {
      if (typeof this.config.sessionToken !== constants.TYPE_OF.STRING) {
        throw new TypeError(error.config.invalidValue('sessionToken'));
      }
      this.s3Config.sessionToken = this.config.sessionToken;
    }

    return this;
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setSslEnabled () {
    if (this.config.hasOwnProperty('ssl')) {
      if (typeof this.config.ssl !== constants.TYPE_OF.BOOLEAN) {
        throw new TypeError(error.config.invalidValue('ssl'));
      }
      this.s3Config.sslEnabled = this.config.ssl;
    }

    return this;
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setMaxRetries () {
    if (this.config.hasOwnProperty('maxRetries')) {
      if (typeof this.config.maxRetries !== constants.TYPE_OF.NUMBER) {
        throw new TypeError(error.config.invalidValue('maxRetries'));
      }
      this.s3Config.maxRetries = this.config.maxRetries;
    }

    return this;
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setAccessKeyId () {
    if (!this.config.hasOwnProperty('accessKeyId') || typeof this.config.accessKeyId !== constants.TYPE_OF.STRING) {
      throw new TypeError(error.config.invalidValue('accessKeyId'));
    }
    this.s3Config.accessKeyId = this.config.accessKeyId;

    return this;
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setSecretAccessKey () {
    if (!this.config.hasOwnProperty('secretAccessKey') || typeof this.config.secretAccessKey !== constants.TYPE_OF.STRING) {
      throw new TypeError(error.config.invalidValue('secretAccessKey'));
    }
    this.s3Config.secretAccessKey = this.config.secretAccessKey;

    return this;
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setBucket () {
    if (!this.config.hasOwnProperty('bucket') || typeof this.config.bucket !== constants.TYPE_OF.STRING) {
      throw new TypeError(error.config.invalidValue('bucket'));
    }
    this.s3Config.Bucket = this.config.bucket;

    return this;
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setRegion () {
    if (!this.config.hasOwnProperty('region') || typeof this.config.region !== constants.TYPE_OF.STRING) {
      throw new TypeError(error.config.invalidValue('region'));
    }
    this.s3Config.region = this.config.region;

    return this;
  }

  /**
   * @returns {S3}
   * @throws {TypeError}
   */
  setAcl () {
    if (this.config.hasOwnProperty('acl')) {
      if (typeof this.config.acl !== constants.TYPE_OF.STRING) {
        throw new TypeError(error.config.invalidValue('acl'));
      }
      this.s3Config.ACL = this.config.acl;
    }

    return this;
  }

  /**
   * @inheritdoc
   */
  write (message, context, severity, callback) {
    //noinspection SpellCheckingInspection
    let self = this,
        keyArr = [uuid.v1({msecs: Date.now(), nsecs: Math.floor(process.hrtime()[1]/100000)})],
        key = (this.appName !== null) ? this.appName + '/' : '';

    if (this.s3UseContext) {
      keyArr.unshift(context);
    }

    key += keyArr.join('_');

    //noinspection JSUnresolvedFunction
    this.s3.upload({
      Bucket: this.s3Config.Bucket,
      Key: key,
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