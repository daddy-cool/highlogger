"use strict";

let Syslog = require('./lib/transporter/syslog'),
    Console = require('./lib/transporter/console'),
    async = require('async'),
    sharedConstants = require('./lib/shared-constants'),
    FACILITY = sharedConstants.FACILITY,
    SEVERITY = sharedConstants.SEVERITY,
    TRANSPORTER = sharedConstants.TRANSPORTER;

/**
 * @class Highlogger
 */
class Highlogger {

  /**
   * @param config
   */
  constructor (config) {
    config = this.populateConfig(config);

    this.transporters = [];
    for (let t in config.transporters) {
      this.addTransporter(config.transporters[t]);
    }
  }

  populateConfig (config) {
    if (typeof config !== 'object') {
      config = {};
    }

    let defaultConfig = {
      transporters: [
          {
            type: TRANSPORTER.CONSOLE
          }
      ]
    };

    for (let c in defaultConfig) {
      if (typeof config[c] === 'undefined') {
        config[c] = defaultConfig[c];
      }
    }

    return config;
  }

  addTransporter (transporterConfig) {
    if (typeof transporterConfig.type !== 'number') {
      throw new Error('unsupported transporter');
    }

    switch (transporterConfig.type) {
      case TRANSPORTER.CONSOLE:
        this.transporters.push(new Console(transporterConfig));
        break;
      case TRANSPORTER.SYSLOG:
        this.transporters.push(new Syslog(transporterConfig));
        break;
      default:
        throw new Error('unsupported transporter');
    }
  }

  log (options) {
    async.each(this.transporters, function (transporter, callback) {
      transporter.log(options, callback);
    }, function (err) {
      if (err) {
        throw err;
      }
    });
  }

  emerg (message) {
    this.log({
      severity: SEVERITY.EMERGENCY,
      message: message
    });
  }

  alert (message) {
    this.log({
      severity: SEVERITY.ALERT,
      message: message
    });
  }

  crit (message) {
    this.log({
      severity: SEVERITY.CRITICAL,
      message: message
    });
  }

  err (message) {
    this.log({
      severity: SEVERITY.ERROR,
      message: message
    });
  }

  warn (message) {
    this.log({
      severity: SEVERITY.WARNING,
      message: message
    });
  }

  notice (message) {
    this.log({
      severity: SEVERITY.NOTICE,
      message: message
    });
  }

  info (message) {
    this.log({
      severity: SEVERITY.INFORMATION,
      message: message
    });
  }

  debug (message) {
    this.log({
      severity: SEVERITY.DEBUG,
      message: message
    });
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