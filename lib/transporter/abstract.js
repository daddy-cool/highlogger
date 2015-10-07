'use strict';

let sharedConstants = require('../shared-constants'),
    SEVERITY = sharedConstants.SEVERITY;

class AbstractTransporter {

  /**
   * @param {Object} config
   */
  constructor (config) {
    this.errorHandler = config.errorHandler;
    this.setSeverityLevel(config.severityLevel);
  }

  /**
   * @param {number} [severityLevel]
   * @returns {AbstractTransporter}
   */
  setSeverityLevel (severityLevel) {
    this.severityLevel = (typeof severityLevel === 'number') ? severityLevel : SEVERITY.NOTICE;

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