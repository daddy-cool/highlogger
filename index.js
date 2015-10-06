"use strict";

let Syslog = require('./lib/transporter/syslog'),
    Console = require('./lib/transporter/console'),
    nodeConsole = require('console'),
    Socket = require('./lib/transporter/Socket'),
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
      case TRANSPORTER.SOCKET:
        this.transporters.push(new Socket(transporterConfig));
        break;
      case TRANSPORTER.SYSLOG:
        this.transporters.push(new Syslog(transporterConfig));
        break;
      default:
        throw new Error('unsupported transporter');
    }
  }

  log (message, options) {
    if (typeof options !== 'object') {
      options = {};
    }

    if (typeof options.severity !== 'number') {
      options.severity = SEVERITY.NOTICE;
    }

    async.each(this.transporters, function (transporter, callback) {
      if (options.severity < transporter.severityLevel) {
        return callback();
      }

      transporter.log(message, options, callback);
    }, function (err) {
      if (err) {
        nodeConsole.error(err);
      }
    });
  }

  emerg (message) {
    this.log(message, {
      severity: SEVERITY.EMERGENCY
    });
  }

  alert (message) {
    this.log(message, {
      severity: SEVERITY.ALERT
    });
  }

  crit (message) {
    this.log(message, {
      severity: SEVERITY.CRITICAL
    });
  }

  err (message) {
    this.log(message, {
      severity: SEVERITY.ERROR
    });
  }

  warn (message) {
    this.log(message, {
      severity: SEVERITY.WARNING
    });
  }

  notice (message) {
    this.log(message, {
      severity: SEVERITY.NOTICE
    });
  }

  info (message) {
    this.log(message, {
      severity: SEVERITY.INFORMATION
    });
  }

  debug (message) {
    this.log(message, {
      severity: SEVERITY.DEBUG
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