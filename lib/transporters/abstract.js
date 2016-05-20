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
   * @name Abstract#prependContext
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
    this.setSizeLimit(config)
        .setPrependContext(config)
        .setSeverity(config)
        .setJson(config)
        .setFallbackPrefix(config)
        .setFallbackTransporter(config);
  }

  /**
   * @param {object} config
   * @param {boolean} [config.prependContext]
   * @returns {Abstract}
   * @throws {Error}
   */
  setPrependContext (config) {
    this.prependContext = false;

    if (config.hasOwnProperty('prependContext')) {
      if (typeof config.prependContext !== constants.TYPE_OF.BOOLEAN) {
        throw new Error(error.config.invalidValue('prependContext'));
      }
      this.prependContext = config.prependContext;
    }

    return this;
  }

  /**
   * @param {object} config
   * @param {boolean} [config.json]
   * @returns {Abstract}
   * @throws {Error}
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
   * @param {object} config
   * @param {number} [config.sizeLimit]
   * @returns {Abstract}
   * @throws {Error}
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
   * @param {object} config
   * @param {Abstract} [config.fallbackTransporter]
   * @returns {Abstract}
   * @throws {Error}
   */
  setFallbackTransporter (config) {
    this.fallbackTransporter = null;

    if (config.hasOwnProperty('fallbackTransporter')) {
      if (!(config.fallbackTransporter instanceof Abstract)) {
        throw new Error(error.config.invalidValue('fallback'));
      }

      this.fallbackTransporter = config.fallbackTransporter;
    }

    return this;
  }

  /**
   * @param {object} config
   * @param {string} [config.severityMin]
   * @param {string} [config.severityMax]
   * @returns {Abstract}
   * @throws {Error}
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
   * @param config
   * @param {string} [config.fallbackPrefix]
   * @returns {Abstract}
   */
  setFallbackPrefix (config) {
    this.fallbackPrefix = '';
    if (config.hasOwnProperty('fallbackPrefix')) {
      if (typeof config.fallbackPrefix !== constants.TYPE_OF.STRING) {
        throw new Error(error.config.invalidValue('fallbackPrefix'));
      }
      this.fallbackPrefix = config.fallbackPrefix;
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

    stringify(this.prependContext ? context : null, message, this.json, function stringifyMessage (stringifiedMessage) {
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

    stringify(this.prependContext ? context : null, message, this.json, function stringifyFallbackMessage (stringifiedMessage) {
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