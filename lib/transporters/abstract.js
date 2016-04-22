'use strict';

let common = require('../common');

/**
 * @namespace Transporters
 */
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
    this.json = (typeof json === common.constants.TYPE_OF.BOOLEAN) ? json : false;

    return this;
  }

  /**
   * @param {Object} [severity]
   * @param {number} [severity.minimum]
   * @param {number} [severity.maximum]
   * @returns {AbstractTransporter}
   */
  setSeverity (severity) {
    if (typeof severity !== common.constants.TYPE_OF.OBJECT || severity === null) {
      severity = {};
    }

    this.severity = {
      minimum: (typeof common.constants.SEVERITY[severity.minimum] === common.constants.TYPE_OF.NUMBER) ? common.constants.SEVERITY[severity.minimum] : common.constants.SEVERITY.emerg,
      maximum: (typeof common.constants.SEVERITY[severity.maximum] === common.constants.TYPE_OF.NUMBER) ? common.constants.SEVERITY[severity.maximum] : common.constants.SEVERITY.debug
    };

    return this;
  }

  /**
   * @param {number} len
   * @returns {AbstractTransporter}
   */
  setMaxMessageSize (len) {
    this.maxMessageSize = (typeof len === common.constants.TYPE_OF.NUMBER) ? len : Infinity;

    return this;
  }

  write () {
    //noinspection JSUnresolvedVariable
    throw new Error(common.error.transporter.notImplemented(this.name, 'write'));
  }

  /**
   * @param {string} name
   * @param {object} config
   * @param {string} [config.severityMin]
   * @param {string} [config.severityMax]
   * @param {number} [config.sizeLimit]
   * @param {boolean} [config.json]
   */
  static validateConfig (name, config) {
    if (config.hasOwnProperty('severityMin') && !common.constants.SEVERITY.hasOwnProperty(config.severityMin)) {
      throw new Error(common.error.config.invalidValue(name, 'severityMin'));
    }

    if (config.hasOwnProperty('severityMax') && !common.constants.SEVERITY.hasOwnProperty(config.severityMax)) {
      throw new Error(common.error.config.invalidValue(name, 'severityMax'));
    }

    if (config.hasOwnProperty('sizeLimit') && typeof config.sizeLimit !== common.constants.TYPE_OF.NUMBER) {
      throw new Error(common.error.config.invalidValue(name, 'sizeLimit'));
    }

    if (config.hasOwnProperty('json') && typeof config.json !== common.constants.TYPE_OF.BOOLEAN) {
      throw new Error(common.error.config.invalidValue(name, 'json'));
    }
  }
}

module.exports = AbstractTransporter;