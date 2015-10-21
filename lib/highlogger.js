'use strict';

let nodeConsole = require('console'),
    async = require('async'),
    Console = require('./lib/transporter/console'),
    AbstractTransporter = require('./lib/transporter/abstract'),
    Socket = require('./lib/transporter/socket'),
    Syslog = require('./lib/transporter/syslog'),
    stringify = require('./lib/stringify');

const SHARED_CONSTANTS = require('./lib/shared-constants');
const FACILITY = SHARED_CONSTANTS.FACILITY;
const SEVERITY = SHARED_CONSTANTS.SEVERITY;
const TRANSPORTER = SHARED_CONSTANTS.TRANSPORTER;
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;
const CONFIG_DEFAULT = {
  transporters: [{
    type: TRANSPORTER.CONSOLE
  }],
  errorHandler: function defaultErrorHandler (err) {
    if (err) {
      nodeConsole.error(err);
    }
  }
};
const MSG_START = '{"message":"';
const MSG_END = '"}';

/**
 * @param {string} message
 * @param {Object} options
 * @param {AbstractTransporter} transporter
 * @param {Function} callback
 */
function writeToTransporter (message, options, transporter, callback) {
  if (options.severity < transporter.severity.minimum || options.severity > transporter.severity.maximum) {
    return callback();
  }

  if (transporter.json && !options.isOriginalMessageTypeObject) {
    message = MSG_START + message + MSG_END;
  }

  transporter.write(message, options, callback);
}

/**
 * @param {HighLogger} ctx
 * @param {string} message
 * @param {Object} [options]
 * @param {number} [severity]
 */
function log (ctx, message, options, severity) {
  if (typeof options !== OBJECT_TYPE.OBJECT) {
    options = {};
  }
  options.severity = severity;
  options.isOriginalMessageTypeObject = typeof message === OBJECT_TYPE.OBJECT;

  async.each(ctx.transporters, writeToTransporter.bind(null, stringify(message), options), ctx.errorHandler);
}

/**
 * @param {Object} [config]
 * @returns {Object}
 * @private
 */
function populateConfig (config) {
  if (typeof config !== OBJECT_TYPE.OBJECT) {
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
    this.errorHandler = config.errorHandler;

    this.transporters = [];
    for (let t in config.transporters) {
      if (!config.transporters.hasOwnProperty(t)) {
        continue;
      }

      let transporterConfig = config.transporters[t];
      if (typeof transporterConfig !== OBJECT_TYPE.OBJECT) {
        continue;
      }

      if (typeof transporterConfig.errorHandler !== OBJECT_TYPE.FUNCTION) {
        transporterConfig.errorHandler = this.errorHandler;
      }
      this.addTransporter(transporterConfig);
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
    log(this, message, options, SEVERITY.EMERG);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  alert (message, options) {
    log(this, message, options, SEVERITY.ALERT);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  critical (message, options) {
    log(this, message, options, SEVERITY.CRIT);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  error (message, options) {
    log(this, message, options, SEVERITY.ERROR);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  warning (message, options) {
    log(this, message, options, SEVERITY.WARN);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  notice (message, options) {
    log(this, message, options, SEVERITY.NOTICE);
  }

  /**
   *
   * @param message
   * @param {Object} [options]
   */
  info (message, options) {
    log(this, message, options, SEVERITY.INFO);
  }

  /**
   *
   * @param {string} prefix
   * @returns {HighLogger~debug}
   */
  getDebug (prefix) {
    let self = this;

    /**
     * @callback HighLogger~debug
     * @param {string} message
     * @param {Object} [options]
     */
    return function debug (message, options) {
      if (typeof options !== OBJECT_TYPE.OBJECT) {
        options = {};
      }

      options.prefix = prefix;
      log(self, message, options, SEVERITY.DEBUG);
    };
  }
}

/**
 * @type {SHARED_CONSTANTS.FACILITY|{KERN, USER, MAIL, DAEMON, AUTH, SYSLOG, LPR, NEWS, UUCP, CLOCK, SEC, FTP, NTP, AUDIT, ALERT, CLOCK2, LOCAL0, LOCAL1, LOCAL2, LOCAL3, LOCAL4, LOCAL5, LOCAL6, LOCAL7}}
 */
HighLogger.FACILITY = FACILITY;

/**
 * @type {SHARED_CONSTANTS.SEVERITY|{EMERG, ALERT, CRIT, ERROR, WARN, NOTICE, INFO, DEBUG}}
 */
HighLogger.SEVERITY = SEVERITY;

/**
 * @type {SHARED_CONSTANTS.TRANSPORTER|{CONSOLE, SOCKET, SYSLOG}}
 */
HighLogger.TRANSPORTER = TRANSPORTER;

module.exports = HighLogger;