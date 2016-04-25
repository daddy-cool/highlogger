'use strict';

let constants = require('../helpers/constants'),
    error = require('../helpers/error');

/**
 * @namespace Transporters
 */
class AbstractTransporter {

  /**
   * @param {object} config
   * @param {string} [config.severityMin]
   * @param {string} [config.severityMax]
   * @param {number} [config.sizeLimit]
   */
  constructor (config) {
    this
      .setSeverity(config.severityMin, config.severityMax)
      .setSizeLimit(config.sizeLimit)
      .setJson(config.json);

    //this.stringify = new common.stringify(config);
  }

  /**
   * @param {boolean} json
   * @returns {AbstractTransporter}
   */
  setJson (json) {
    this.json = (typeof json !== constants.TYPE_OF.UNDEFINED) ? json : false;

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

  /**
   * @param {number} len
   * @returns {AbstractTransporter}
   */
  setSizeLimit (len) {
    this.sizeLimit = (typeof len !== constants.TYPE_OF.UNDEFINED) ? len : Infinity;

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

    if (config.hasOwnProperty('sizeLimit') && typeof config.sizeLimit !== constants.TYPE_OF.NUMBER) {
      throw new Error(error.config.invalidValue(name, 'sizeLimit'));
    }

    if (config.hasOwnProperty('json') && typeof config.json !== constants.TYPE_OF.BOOLEAN) {
      throw new Error(error.config.invalidValue(name, 'json'));
    }
  }
}

module.exports = AbstractTransporter;