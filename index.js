'use strict';

let nodeConsole = require('console'),
    async = require('async'),
    Console = require('./lib/transporter/console'),
    Socket = require('./lib/transporter/socket'),
    Syslog = require('./lib/transporter/syslog'),
    stringify = require('./lib/stringify');

const SHARED_CONSTANTS = require('./lib/shared-constants');
const FACILITY = SHARED_CONSTANTS.FACILITY;
const SEVERITY = SHARED_CONSTANTS.SEVERITY;
const TRANSPORTER = SHARED_CONSTANTS.TRANSPORTER;
const CONFIG_DEFAULT = {
  transporters: [{
    type: TRANSPORTER.CONSOLE,
    severity: {
      minimum: SEVERITY.EMERGENCY,
      maximum: SEVERITY.DEBUG
    }
  }],
  onErrorFunction: function defaultErrorHandler (err) {
    if (err) {
      nodeConsole.error(err);
    }
  }
};

/**
 * @param {string} message
 * @param {Object} [options]
 * @param {number} [severity]
 * @param {HighLogger} instance
 * @private
 */
function log (message, options, severity, instance) {
  let isMessageObject = (typeof message === 'object'),
      msg = stringify(message);

  if (typeof options !== 'object') {
    options = {};
  }
  options.severity = severity;

  function writeToTransporter (transporter, callback) {
    if (options.severity < transporter.severity.minimum || options.severity > transporter.severity.maximum) {
      return callback();
    }

    msg = (transporter.json && !isMessageObject)
        ? '{"message":"' + msg + '"}'
        : msg;

    transporter.write(msg, options, callback);
  }

  async.each(instance.transporters, writeToTransporter, instance.errorHandler);
}

/**
 * @param {Object} [config]
 * @returns {Object}
 * @private
 */
function populateConfig (config) {
  if (typeof config !== 'object') {
    config = {};
  }

  for (let c in CONFIG_DEFAULT) {
    if (!config.hasOwnProperty(c) && CONFIG_DEFAULT.hasOwnProperty(c)) {
      config[c] = CONFIG_DEFAULT[c];
    }
  }

  return config;
}

/**
 * @class HighLogger
 */
class HighLogger {

  /**
   * @param {Object} [config]
   */
  constructor (config) {
    config = populateConfig(config);
    this.errorHandler = config.onErrorFunction;

    this.transporters = [];
    for (let t in config.transporters) {
      if (config.transporters.hasOwnProperty(t)) {
        let transporterConfig = config.transporters[t];
        if (typeof transporterConfig === 'object') {
          transporterConfig.errorHandler = this.errorHandler;
          this.addTransporter(transporterConfig);
        }
      }
    }
  }

  /**
   * @param {Object} transporterConfig
   */
  addTransporter (transporterConfig) {
    switch (transporterConfig.type) {
      case TRANSPORTER.CONSOLE:
        this.transporters.push(new Console(transporterConfig));
        break;
      case TRANSPORTER.SOCKET:
        this.transporters.push(new Socket(transporterConfig));
        break;
      case TRANSPORTER.SYSLOG:
        this.transporters.push(new Syslog(transporterConfig));
        break;
      default:
        transporterConfig.errorHandler(new Error('unsupported transporter'));
    }
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  emergency (message, options) {
    log(message, options, SEVERITY.EMERGENCY, this);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  alert (message, options) {
    log(message, options, SEVERITY.ALERT, this);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  critical (message, options) {
    log(message, options, SEVERITY.CRITICAL, this);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  error (message, options) {
    log(message, options, SEVERITY.ERROR, this);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  warning (message, options) {
    log(message, options, SEVERITY.WARNING, this);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  notice (message, options) {
    log(message, options, SEVERITY.NOTICE, this);
  }

  /**
   *
   * @param message
   * @param {Object} [options]
   */
  info (message, options) {
    log(message, options, SEVERITY.INFO, this);
  }

  /**
   *
   * @param {string} prefix
   * @returns {function}
   */
  getDebug (prefix) {
    let self = this;

    /**
     * @param message
     * @param {Object} [options]
     */
    return function highHighLoggerDebug (message, options) {
      if (typeof options !== 'object') {
        options = {};
      }
      options.prefix = prefix;
      log(message, options, SEVERITY.DEBUG, self);
    };
  }
}

/**
 * @type {module.exports.FACILITY}
 */
HighLogger.FACILITY = FACILITY;

/**
 * @type {module.exports.SEVERITY}
 */
HighLogger.SEVERITY = SEVERITY;

/**
 * @type {module.exports.TRANSPORTER}
 */
HighLogger.TRANSPORTER = TRANSPORTER;

module.exports = HighLogger;