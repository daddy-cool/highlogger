'use strict';

let constants = require('../helpers/constants'),
    stringify = require('../helpers/stringify'),
    error = require('../helpers/error');

/**
 * @class Abstract
 */
class Abstract {
  /**
   * @name Abstract#json
   * @type boolean
   * @default false
   */
  /**
   * @name Abstract#severity
   * @type object
   */
  /**
   * @name Abstract#severity.minimum
   * @type number
   * @default 0
   */
  /**
   * @name Abstract#severity.maximum
   * @type number
   * @default 7
   */
  /**
   * @name Abstract#useContext
   * @type boolean
   * @default false
   */
  /**
   * @name Abstract#sizeLimit
   * @type number
   * @default Infinity
   */
  /**
   * @name Abstract#fallbackPrefix
   * @type string
   */
  /**
   * @name Abstract#fallbackTransporter
   * @type Abstract
   * @default null
   */

  /**
   * @param {object} config
   */
  constructor (config) {
    this.config = config;
    this.useContext = false;
    this.json = false;
    this.sizeLimit = Infinity;
    this.fallbackTransporter = null;
    this.severity = {
      minimum: constants.SEVERITY.emerg,
      maximum: constants.SEVERITY.debug
    };
    this.fallbackPrefix = '';

    this.setSizeLimit()
        .setUseContext()
        .setSeverity()
        .setJson()
        .setFallbackPrefix()
        .setFallbackTransporter();
  }

  /**
   * @returns {Abstract}
   * @throws {TypeError}
   */
  setUseContext () {
    if (this.config.hasOwnProperty('useContext')) {
      if (typeof this.config.useContext !== constants.TYPE_OF.BOOLEAN) {
        throw new TypeError(error.config.invalidValue('useContext'));
      }
      this.useContext = this.config.useContext;
    }

    return this;
  }

  /**
   * @returns {Abstract}
   * @throws {TypeError}
   */
  setJson () {
    if (this.config.hasOwnProperty('json')) {
      if (typeof this.config.json !== constants.TYPE_OF.BOOLEAN) {
        throw new TypeError(error.config.invalidValue('json'));
      }
      this.json = this.config.json;
    }

    return this;
  }

  /**
   * @returns {Abstract}
   * @throws {TypeError}
   */
  setSizeLimit () {
    if (this.config.hasOwnProperty('sizeLimit')) {
      if (typeof this.config.sizeLimit !== constants.TYPE_OF.NUMBER) {
        throw new TypeError(error.config.invalidValue('sizeLimit'));
      }
      this.sizeLimit = this.config.sizeLimit;
    }

    return this;
  }

  /**
   * @returns {Abstract}
   * @throws {TypeError}
   */
  setFallbackTransporter () {
    if (this.config.hasOwnProperty('fallbackTransporter')) {
      if (!(this.config.fallbackTransporter instanceof Abstract)) {
        throw new TypeError(error.config.invalidValue('fallback'));
      }

      this.fallbackTransporter = this.config.fallbackTransporter;
    }

    return this;
  }

  /**
   * @returns {Abstract}
   * @throws {TypeError}
   */
  setSeverity () {
    if (this.config.hasOwnProperty('severityMin')) {
      if (!constants.SEVERITY.hasOwnProperty(this.config.severityMin)) {
        throw new TypeError(error.config.invalidValue('severityMin'));
      }
      this.severity.minimum = constants.SEVERITY[this.config.severityMin];
    }

    if (this.config.hasOwnProperty('severityMax')) {
      if (!constants.SEVERITY.hasOwnProperty(this.config.severityMax)) {
        throw new TypeError(error.config.invalidValue('severityMax'));
      }
      this.severity.maximum = constants.SEVERITY[this.config.severityMax];
    }

    return this;
  }

  /**
   * @returns {Abstract}
   * @throws {TypeError}
   */
  setFallbackPrefix () {
    if (this.config.hasOwnProperty('fallbackPrefix')) {
      if (typeof this.config.fallbackPrefix !== constants.TYPE_OF.STRING) {
        throw new TypeError(error.config.invalidValue('fallbackPrefix'));
      }
      this.fallbackPrefix = this.config.fallbackPrefix;
    }

    return this;
  }

  /**
   * @param {*} message
   * @param {number} severity
   * @param {string} context
   * @param {function} callback
   */
  log (message, severity, context, callback) {
    let self = this;

    stringify(this.useContext ? context : null, message, this.json, function stringifyMessage (stringifiedMessage) {
      if (stringifiedMessage.length <= self.sizeLimit) {
        return self.write(stringifiedMessage, context, severity, callback);
      }

      if (!self.fallbackTransporter) {
        return self.fallback(severity, context, callback);
      }

      self.fallbackTransporter.log(message, severity, context, self.fallback.bind(self, severity, context, callback));
    });
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * @param {number} severity
   * @param {string} context
   * @param {function} callback
   * @param {*} [fallbackErr]
   * @param {string} [fallbackMessage]
   */
  fallback (severity, context, callback, fallbackErr, fallbackMessage) {
    let self = this,
        message;

    if (this.json) {
      message = {message: error.transporter.exceededSizeLimit()};
      if (typeof fallbackMessage !== constants.TYPE_OF.UNDEFINED) {
        message.fallback = fallbackMessage;
      }
    } else {
      message = error.transporter.exceededSizeLimit() + (typeof fallbackMessage !== constants.TYPE_OF.UNDEFINED ? ', ' + fallbackMessage : '');
    }

    stringify(this.useContext ? context : null, message, this.json, function stringifyFallbackMessage (stringifiedMessage) {
      self.write(stringifiedMessage, context, severity, callback);
    });
  }

  //noinspection Eslint
  /**
   * @abstract
   * @param {string} message
   * @param {string} context
   * @param {number} severity
   * @param {function} callback
   */
  write (message, context, severity, callback) {
    throw new Error(error.general.notImplemented('write'));
  }
}

module.exports = Abstract;