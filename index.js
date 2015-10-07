'use strict';

let nodeConsole = require('console'),
    async = require('async'),
    Syslog = require('./lib/transporter/syslog'),
    Socket = require('./lib/transporter/socket'),
    stringify = require('./lib/stringify'),
    sharedConstants = require('./lib/shared-constants'),
    FACILITY = sharedConstants.FACILITY,
    SEVERITY = sharedConstants.SEVERITY,
    TRANSPORTER = sharedConstants.TRANSPORTER;

/**
 * @param {Error} [err]
 */
function defaultErrorHandler (err) {
  if (err) {
    nodeConsole.error(err);
  }
}

class Highlogger {

  /**
   * @param {Object} [config]
   */
  constructor (config) {
    this._populateConfig(config);

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
   * @param {Object} [config]
   * @returns {Object}
   * @private
   */
  _populateConfig (config) {
    let defaultConfig = {
      transporters: [{type: TRANSPORTER.CONSOLE}],
      onErrorFunction: defaultErrorHandler
    };

    if (typeof config !== 'object') {
      config = {};
    }

    for (let c in defaultConfig) {
      if (!config.hasOwnProperty(c) && defaultConfig.hasOwnProperty(c)) {
        config[c] = defaultConfig[c];
      }
    }

    return config;
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
   * @param {string} message
   * @param {Object} [options]
   * @param {number} [severity]
   */
  log (message, options, severity) {
    message = stringify(message);

    if (typeof options !== 'object') {
      options = {};
    }

    if (typeof severity === 'number') {
      options.severity = severity;
    } else if (typeof options.severity !== 'number') {
      options.severity = SEVERITY.NOTICE;
    }

    function writeToTransporter (transporter, callback) {
      if (options.severity < transporter.severityLevel) {
        return callback();
      }

      transporter.write(message, options, callback);
    }

    async.each(this.transporters, writeToTransporter, this.errorHandler);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  emergency (message, options) {
    this.log(message, options, SEVERITY.EMERGENCY);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  alert (message, options) {
    this.log(message, options, SEVERITY.ALERT);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  critical (message, options) {
    this.log(message, options, SEVERITY.CRITICAL);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  error (message, options) {
    this.log(message, options, SEVERITY.ERROR);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  warning (message, options) {
    this.log(message, options, SEVERITY.WARNING);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  notice (message, options) {
    this.log(message, options, SEVERITY.NOTICE);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  info (message, options) {
    this.log(message, options, SEVERITY.INFO);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  debug (message, options) {
    this.log(message, options, SEVERITY.DEBUG);
  }
}

/**
 * @type {module.exports.FACILITY}
 */
Highlogger.FACILITY = FACILITY;

/**
 * @type {module.exports.SEVERITY}
 */
Highlogger.SEVERITY = SEVERITY;

/**
 * @type {module.exports.TRANSPORTER}
 */
Highlogger.TRANSPORTER = TRANSPORTER;

module.exports = Highlogger;