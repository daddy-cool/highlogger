'use strict';

let constants = require('../helpers/constants'),
    error = require('../helpers/error');

class AbstractTransporter {

  /**
   * @param {object} config
   * @param {number} [config.sizeLimit]
   * @param {string} [config.severityMin]
   * @param {string} [config.severityMax]
   * @param {AbstractTransporter} [config.fallback]
   */
  constructor (config) {

    this
      .setSizeLimit(config.sizeLimit)
      .setSeverity(config.severityMin, config.severityMax)
      .setFallback(config.fallback);
  }

  /**
   * @param {number} sizeLimit
   * @returns {AbstractTransporter}
   */
  setSizeLimit (sizeLimit) {
    this.sizeLimit = typeof sizeLimit !== constants.TYPE_OF.UNDEFINED ? sizeLimit : Infinity;

    return this;
  }

  /**
   * @param fallback
   * @returns {AbstractTransporter}
   */
  setFallback (fallback) {
    this.fallback = fallback;

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
    throw new Error(error.transporter.notImplemented('write'));
  }

  /**
   * @param {object} config
   * @param {string} [config.severityMin]
   * @param {string} [config.severityMax]
   * @param {number} [config.sizeLimit]
   * @param {boolean} [config.json]
   */
  static validate (config) {
    if (config.hasOwnProperty('sizeLimit') && typeof config.sizeLimit !== constants.TYPE_OF.NUMBER) {
      throw new Error(error.config.invalidValue('severityMin'));
    }

    if (config.hasOwnProperty('severityMin') && !constants.SEVERITY.hasOwnProperty(config.severityMin)) {
      throw new Error(error.config.invalidValue('severityMin'));
    }

    if (config.hasOwnProperty('severityMax') && !constants.SEVERITY.hasOwnProperty(config.severityMax)) {
      throw new Error(error.config.invalidValue('severityMax'));
    }

    if (config.hasOwnProperty('json') && typeof config.json !== constants.TYPE_OF.BOOLEAN) {
      throw new Error(error.config.invalidValue('json'));
    }
  }
}

module.exports = AbstractTransporter;