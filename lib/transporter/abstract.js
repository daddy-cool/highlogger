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
   * @param {number} [config.messageLength]
   */
  constructor (config) {
    this.errorHandler = config.errorHandler;
    this.setSeverity(config.severity);
    this.setJson(config.json);
    this.setMessageLength(config.messageLength);
    this.setTrace(config.trace);
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
      minimum: (typeof severity.minimum === OBJECT_TYPE.NUMBER) ? severity.minimum : SEVERITY.EMERG,
      maximum: (typeof severity.maximum === OBJECT_TYPE.NUMBER) ? severity.maximum : SEVERITY.DEBUG
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
  setMessageLength (len) {
    this.messageLength = (typeof len === OBJECT_TYPE.NUMBER) ? len : Infinity;

    return this;
  }

  /**
   * @param {boolean} trace
   * @returns {AbstractTransporter}
   */
  setTrace (trace) {
    this.trace = (typeof trace === OBJECT_TYPE.BOOLEAN) ? trace : false;

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