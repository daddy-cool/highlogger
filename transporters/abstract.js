'use strict';

let constants = require('../helpers/constants'),
    error = require('../helpers/error');

/**
 * @namespace Transporters
 */
class AbstractTransporter {

  /**
   * @param {object} config
   * @param {string} [config.fallback]
   * @param {string} [config.severityMin]
   * @param {string} [config.severityMax]
   * @param {number} [config.sizeLimit]
   */
  constructor (config) {
    this
      .setFallback(config.fallback)
      .setSeverity(config.severityMin, config.severityMax);

    //this.stringify = new common.stringify(config);
  }

  /**
   * @param transporter
   * @returns {AbstractTransporter}
   */
  setFallback (transporter) {
    this.fallback = transporter;

    return this;
  }

  /**
   * @param {string} [severityMin]
   * @param {string} [severityMax]
   * @returns {AbstractTransporter}
   */
  setSeverity (severityMin, severityMax) {
    this.severity = {
      minimum: (typeof severityMin !== constants.TYPE_OF.UNDEFINED) ? constants.SEVERITY[severityMin] : constants.SEVERITY.emerg,
      maximum: (typeof severityMax !== constants.TYPE_OF.UNDEFINED) ? constants.SEVERITY[severityMax] : constants.SEVERITY.debug
    };

    return this;
  }

  write () {
    //noinspection JSUnresolvedVariable
    throw new Error(error.transporter.notImplemented(this.name, 'write'));
  }

  /**
   * @param {string} name
   * @param {object} config
   * @param {string} [config.severityMin]
   * @param {string} [config.severityMax]
   * @param {number} [config.sizeLimit]
   * @param {boolean} [config.json]
   */
  static validate (name, config) {
    if (config.hasOwnProperty('severityMin') && !constants.SEVERITY.hasOwnProperty(config.severityMin)) {
      throw new Error(error.config.invalidValue(name, 'severityMin'));
    }

    if (config.hasOwnProperty('severityMax') && !constants.SEVERITY.hasOwnProperty(config.severityMax)) {
      throw new Error(error.config.invalidValue(name, 'severityMax'));
    }
  }
}

module.exports = AbstractTransporter;