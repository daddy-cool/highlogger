'use strict';

let Abstract = require('./abstract'),
    error = require('../helpers/error'),
    constants = require('../helpers/constants');

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
  }

  /**
   * @inheritdoc
   */
  log (message, severity, context, callback) {
    super.log(message, severity, context, callback);
  }

  /**
   * @inheritdoc
   */
  write (message, severity, callback) {
    callback();
  }
}

module.exports = S3;