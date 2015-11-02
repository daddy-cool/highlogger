'use strict';

let nodeConsole = require('console'),
    async = require('async'),
    Console = require('./transporter/console'),
    Socket = require('./transporter/socket'),
    Syslog = require('./transporter/syslog'),
    stringify = require('./stringify'),
    currentInstance;

const SHARED_CONSTANTS = require('./shared-constants');
const CONFIG_DEFAULT = {
  transporters: [{
    type: SHARED_CONSTANTS.TRANSPORTER.CONSOLE
  }],
  errorHandler: function defaultErrorHandler (err) {
    if (err) {
      if (err instanceof Error) {
        throw Error;
      } else {
        throw new Error(err);
      }
    }
  },
  debugKeys: {
    include: [],
    exclude: []
  }
};
const MSG_START = '{"message":"';
const MSG_END = '"}';
const EMPTY = '';

/**
 * @param {string} message
 * @param {Object} options
 * @param {number} options.severity
 * @param {boolean} [options.isOriginalMessageTypeObject]
 * @param {AbstractTransporter} transporter
 * @param {boolean} [transporter.json]
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
 * @param {Highlogger} ctx
 * @param {string} message
 * @param {Object} [options]
 * @param {number} [severity]
 */
function log (ctx, message, options, severity) {
  if (typeof options !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
    options = {};
  }

  options.severity = severity;
  options.isOriginalMessageTypeObject = typeof message === SHARED_CONSTANTS.OBJECT_TYPE.OBJECT;

  async.each(ctx.transporters, writeToTransporter.bind(null, stringify(message), options), ctx.errorHandler);
}

/**
 * @param {Object} [config]
 * @returns {Object}
 * @private
 */
function populateConfig (config) {
  if (typeof config !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
    config = {};
  }

  for (let c in CONFIG_DEFAULT) {
    if (!config.hasOwnProperty(c) && CONFIG_DEFAULT.hasOwnProperty(c)) {
      config[c] = CONFIG_DEFAULT[c];
    }
  }

  if (typeof config.errorHandler !== SHARED_CONSTANTS.OBJECT_TYPE.FUNCTION) {
    config.errorHandler = CONFIG_DEFAULT.errorHandler;
  }

  if (typeof config.debugKeys !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
    config.debugKeys = CONFIG_DEFAULT.debugKeys;
  } else {
    if (
      typeof config.debugKeys.include !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT ||
      !(config.debugKeys.include instanceof Array)
    ) {
      config.debugKeys.include = CONFIG_DEFAULT.debugKeys.include;
    }
    if (
      typeof config.debugKeys.exclude !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT ||
      !(config.debugKeys.exclude instanceof Array)
    ) {
      config.debugKeys.exclude = CONFIG_DEFAULT.debugKeys.exclude;
    }
  }

  return config;
}


function setupDebugKeys (debugKeys) {
  let includeKeys = [],
      excludeKeys = [];

  debugKeys.include.forEach(function addIncludeKey (includeKey) {
    if (typeof includeKey !== SHARED_CONSTANTS.OBJECT_TYPE.STRING || includeKey.length === 0) {
      return;
    }

    includeKeys.push(new RegExp('^' + includeKey.replace(/\*/g, '.*?') + '$'));
  });

  debugKeys.exclude.forEach(function addExcludeKey (excludeKey) {
    if (typeof excludeKey !== SHARED_CONSTANTS.OBJECT_TYPE.STRING || excludeKey.length === 0) {
      return;
    }

    excludeKeys.push(new RegExp('^' + excludeKey.replace(/\*/g, '.*?') + '$'));
  });

  return {include: includeKeys, exclude: excludeKeys};
}

/**
 * @class Highlogger
 */
class Highlogger {

  /**
   * @param {Object} [config]
   */
  constructor (config) {
    config = populateConfig(config);
    this.errorHandler = config.errorHandler;
    this.debugKeys = setupDebugKeys(config.debugKeys);

    this.transporters = [];
    for (let t in config.transporters) {
      /* istanbul ignore if*/
      if (!config.transporters.hasOwnProperty(t)) {
        continue;
      }

      let transporterConfig = config.transporters[t];
      if (typeof transporterConfig !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
        continue;
      }

      if (typeof transporterConfig.errorHandler !== SHARED_CONSTANTS.OBJECT_TYPE.FUNCTION) {
        transporterConfig.errorHandler = this.errorHandler;
      }
      this.addTransporter(transporterConfig);
    }

    currentInstance = this;
  }

  /**
   * @param {Object} transporterConfig
   */
  addTransporter (transporterConfig) {
    switch (transporterConfig.type) {
      case SHARED_CONSTANTS.TRANSPORTER.CONSOLE:
        this.transporters.push(new Console(transporterConfig));
        break;
      case SHARED_CONSTANTS.TRANSPORTER.SOCKET:
        this.transporters.push(new Socket(transporterConfig));
        break;
      case SHARED_CONSTANTS.TRANSPORTER.SYSLOG:
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
    log(this, message, options, SHARED_CONSTANTS.SEVERITY.EMERG);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  alert (message, options) {
    log(this, message, options, SHARED_CONSTANTS.SEVERITY.ALERT);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  critical (message, options) {
    log(this, message, options, SHARED_CONSTANTS.SEVERITY.CRIT);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  error (message, options) {
    log(this, message, options, SHARED_CONSTANTS.SEVERITY.ERROR);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  warning (message, options) {
    log(this, message, options, SHARED_CONSTANTS.SEVERITY.WARN);
  }

  /**
   * @param message
   * @param {Object} [options]
   */
  notice (message, options) {
    log(this, message, options, SHARED_CONSTANTS.SEVERITY.NOTICE);
  }

  /**
   *
   * @param message
   * @param {Object} [options]
   */
  info (message, options) {
    log(this, message, options, SHARED_CONSTANTS.SEVERITY.INFO);
  }

  /**
   *
   * @param {string} [debugKey]
   * @returns {Highlogger~debug}
   */
  getDebug (debugKey) {
    let self = this,
        excluded = false,
        included = false;

    if (typeof debugKey !== SHARED_CONSTANTS.OBJECT_TYPE.STRING) {
      debugKey = EMPTY;
    }

    self.debugKeys.exclude.forEach(function isExcludedFn (excludeKey) {
      if (excludeKey.test(debugKey)) {
        excluded = true;
      }
    });

    if (excluded) {
      /* istanbul ignore next - dummy function */
      return function excludedDebug () {};
    }

    self.debugKeys.include.forEach(function isIncludedFn (includeKey) {
      if (includeKey.test(debugKey)) {
        included = true;
      }
    });

    if (!included) {
      /* istanbul ignore next - dummy function */
      return function notIncludedDebug () {};
    }

    /**
     * @callback Highlogger~debug
     * @param {string} message
     * @param {Object} [options]
     */
    return function debug (message, options) {
      if (typeof options !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
        options = {};
      }

      if (typeof options.debugKey !== SHARED_CONSTANTS.OBJECT_TYPE.STRING) {
        options.debugKey = debugKey;
      }

      log(self, message, options, SHARED_CONSTANTS.SEVERITY.DEBUG);
    };
  }

  /**
   * @returns {Highlogger}
   */
  static getInstance () {
    if (typeof currentInstance !== SHARED_CONSTANTS.OBJECT_TYPE.UNDEFINED) {
      return currentInstance;
    }

    throw new Error('Highlogger needs to be instanced at least once');
  }
}

/**
 * @type {SHARED_CONSTANTS.FACILITY|{KERN, USER, MAIL, DAEMON, AUTH, SYSLOG, LPR, NEWS, UUCP, CLOCK, SEC, FTP, NTP, AUDIT, ALERT, CLOCK2, LOCAL0, LOCAL1, LOCAL2, LOCAL3, LOCAL4, LOCAL5, LOCAL6, LOCAL7}}
 */
Highlogger.FACILITY = SHARED_CONSTANTS.FACILITY;

/**
 * @type {SHARED_CONSTANTS.SEVERITY|{EMERG, ALERT, CRIT, ERROR, WARN, NOTICE, INFO, DEBUG}}
 */
Highlogger.SEVERITY = SHARED_CONSTANTS.SEVERITY;

/**
 * @type {SHARED_CONSTANTS.TRANSPORTER|{CONSOLE, SOCKET, SYSLOG}}
 */
Highlogger.TRANSPORTER = SHARED_CONSTANTS.TRANSPORTER;

module.exports = Highlogger;