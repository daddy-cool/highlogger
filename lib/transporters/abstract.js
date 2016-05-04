'use strict';

let constants = require('../helpers/constants'),
    stringify = require('../helpers/stringify'),
    error = require('../helpers/error');

/**
 * @class AbstractTransporter
 */
class AbstractTransporter {

  /**
   * @param {Object} config
   */
  constructor (config) {

    this
      .setSizeLimit(config)
      .setSeverity(config)
      .setJson(config)
      .setFallbackTransporter(config);
  }

  /**
   * @param {Object} config
   * @param {Boolean} [config.json]
   * @returns {AbstractTransporter}
   */
  setJson (config) {
    this.json = false;

    if (config.hasOwnProperty('json')) {
      if (typeof config.json !== constants.TYPE_OF.BOOLEAN) {
        throw new Error(error.config.invalidValue('json'));
      }
      this.json = config.json;
    }

    return this;
  }

  /**
   * @param {Object} config
   * @param {Number} [config.sizeLimit]
   * @returns {AbstractTransporter}
   */
  setSizeLimit (config) {
    this.sizeLimit = Infinity;

    if (config.hasOwnProperty('sizeLimit')) {
      if (typeof config.sizeLimit !== constants.TYPE_OF.NUMBER) {
        throw new Error(error.config.invalidValue('sizeLimit'));
      }
      this.sizeLimit = config.sizeLimit;
    }

    return this;
  }

  /**
   * @param {Object} config
   * @param {AbstractTransporter} [config.fallbackTransporter]
   * @returns {AbstractTransporter}
   */
  setFallbackTransporter (config) {
    this.fallbackTransporter = null;

    if (config.hasOwnProperty('fallbackTransporter')) {
      if (!config.fallbackTransporter instanceof AbstractTransporter) {
        throw new Error(error.config.invalidValue('fallback'));
      }

      this.fallbackTransporter = config.fallbackTransporter;
    }

    return this;
  }

  /**
   * @param {Object} config
   * @param {String} [config.severityMin]
   * @param {String} [config.severityMax]
   * @returns {AbstractTransporter}
   */
  setSeverity (config) {
    this.severity = {
      minimum: constants.SEVERITY.emerg,
      maximum: constants.SEVERITY.debug
    };

    if (config.hasOwnProperty('severityMin')) {
      if (!constants.SEVERITY.hasOwnProperty(config.severityMin)) {
        throw new Error(error.config.invalidValue('severityMin'));
      }
      this.severity.minimum = constants.SEVERITY[config.severityMin];
    }

    if (config.hasOwnProperty('severityMax')) {
      if (!constants.SEVERITY.hasOwnProperty(config.severityMax)) {
        throw new Error(error.config.invalidValue('severityMax'));
      }
      this.severity.maximum = constants.SEVERITY[config.severityMax];
    }

    return this;
  }

  /**
   * @param {*} message
   * @param {Number} severity
   * @param {String} context
   * @param {Function} callback
   */
  log (message, severity, context, callback) {
    let self = this;

    stringify(context, message, this.json, function stringifyMessage (stringifiedMessage) {
      if (message.length <= self.sizeLimit) {
        return self.write(stringifiedMessage, severity, callback);
      }

      if (!self.fallbackTransporter) {
        return self.fallback(severity, context, callback);
      }

      return self.fallbackTransporter.log(message, severity, context, self.fallback.bind(self, severity, context, callback));
    });
  }

  //noinspection JSUnusedLocalSymbols
  fallback (severity, context, callback, fallbackErr, fallbackMessage) {
    let self = this,
        message;

    if (this.json) {
      message = {message: error.transporter.exceededSizeLimit(self.sizeLimit), fallback: fallbackMessage};
    } else {
      message = error.transporter.exceededSizeLimit(self.sizeLimit) + (typeof fallbackMessage !== constants.TYPE_OF.UNDEFINED ? ', ' + fallbackMessage : '');
    }

    stringify(context, message, this.json, function stringifyFallbackMessage (stringifiedMessage) {
      self.write(stringifiedMessage, severity, callback);
    });
  }

  //noinspection Eslint
  /**
   * @param {String} message
   * @param {Number} severity
   * @param {Function} callback
   */
  write (message, severity, callback) {
    throw new Error(error.transporter.notImplemented('write'));
  }
}

module.exports = AbstractTransporter;