'use strict';

let Stringify = require('../stringify');

const SHARED_CONSTANTS = require('../shared-constants');
const SEVERITY = SHARED_CONSTANTS.SEVERITY;
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;

class AbstractTransporter {

  /**
   * @param {Object} config
   * @param {Object} [config.severity]
   * @param {number} [config.maxMessageSize]
   */
  constructor (config) {
    this
      .setSeverity(config.severity)
      .setMaxMessageSize(config.maxMessageSize)
      .setJson(config.json);

    this.stringify = new Stringify(config);
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
   * @param {Object} [severity]
   * @param {number} [severity.minimum]
   * @param {number} [severity.maximum]
   * @returns {AbstractTransporter}
   */
  setSeverity (severity) {
    if (typeof severity !== OBJECT_TYPE.OBJECT || severity === null) {
      severity = {};
    }

    this.severity = {
      minimum: (typeof SEVERITY[severity.minimum] === OBJECT_TYPE.NUMBER) ? SEVERITY[severity.minimum] : SEVERITY.emerg,
      maximum: (typeof SEVERITY[severity.maximum] === OBJECT_TYPE.NUMBER) ? SEVERITY[severity.maximum] : SEVERITY.debug
    };

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
    throw new Error("write not implemented");
  }
}

module.exports = AbstractTransporter;