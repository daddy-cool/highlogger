'use strict';

let sharedConstants = require('../shared-constants'),
    SEVERITY = sharedConstants.SEVERITY;

const SHARED_CONSTANTS = require('../shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;

class AbstractTransporter {

  /**
   * @param {Object} config
   */
  constructor (config) {
    this.errorHandler = config.errorHandler;
    this.setSeverity(config.severity);
  }

  /**
   * @param {Object} [severity]
   * @returns {AbstractTransporter}
   */
  setSeverity (severity) {
    this.severity = {
      minimum: (typeof severity.minimum === OBJECT_TYPE.NUMBER) ? severity.minimum : SEVERITY.DEFAULT,
      maximum: (typeof severity.maximum === OBJECT_TYPE.NUMBER) ? severity.maximum : SEVERITY.DEFAULT
    };

    return this;
  }

  /**
   * @param {string} message
   * @param {Object} options
   * @param {Function} callback
   */
  write (message, options, callback) {
    callback(new Error("AbstractTransporter.write method was not overwritten"));
  }
}

module.exports = AbstractTransporter;