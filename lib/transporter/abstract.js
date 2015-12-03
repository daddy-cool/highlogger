'use strict';

const SHARED_CONSTANTS = require('../shared-constants');
const SEVERITY = SHARED_CONSTANTS.SEVERITY;
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;

class AbstractTransporter {

  /**
   * @param {Object} config
   * @param {Function} config.errorHandler;
   * @param {Object} [config.severity]
   * @param {boolean} [config.json]
   * @param {number} [config.maxMessageSize]
   */
  constructor (config) {
    this.errorHandler = config.errorHandler;
    this.setSeverity(config.severity);
    this.setJson(config.json);
    this.setMaxMessageSize(config.maxMessageSize);
  }

  /**
   * @param {Object} [severity]
   * @param {number} [severity.minimum]
   * @param {number} [severity.maximum]
   * @returns {AbstractTransporter}
   */
  setSeverity (severity) {
    if (typeof severity !== OBJECT_TYPE.OBJECT) {
      severity = {};
    }

    this.severity = {
      minimum: (typeof SEVERITY[severity.minimum] === OBJECT_TYPE.NUMBER) ? SEVERITY[severity.minimum] : SEVERITY.emerg,
      maximum: (typeof SEVERITY[severity.maximum] === OBJECT_TYPE.NUMBER) ? SEVERITY[severity.maximum] : SEVERITY.debug
    };

    return this;
  }

  /**
   * @param {boolean} json
   * @returns {AbstractTransporter}
   */
  setJson (json) {
    this.json = (typeof json === OBJECT_TYPE.BOOLEAN) ? json : false;

    return this;
  }

  /**
   * @param {number} len
   * @returns {AbstractTransporter}
   */
  setMaxMessageSize (len) {
    this.maxMessageSize = (typeof len === OBJECT_TYPE.NUMBER) ? len : Infinity;

    return this;
  }

  /**
   * @param {*} message
   * @param {Object} options
   * @param {Function} callback
   */
  write (message, options, callback) {
    callback(new Error("write not implemented"));
  }
}

module.exports = AbstractTransporter;