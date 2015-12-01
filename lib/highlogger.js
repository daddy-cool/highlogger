'use strict';

let async = require('async'),
    stackTrace = require('stack-trace'),
    Console = require('./transporter/console'),
    Socket = require('./transporter/socket'),
    Syslog = require('./transporter/syslog'),
    stringify = require('./stringify'),
    currentInstance;

const SHARED_CONSTANTS = require('./shared-constants');
const EMPTY = '';

/**
 * @param err
 */
function defaultErrorHandler (err) {
  if (err) {
    if (err instanceof Error) {
      throw Error;
    } else {
      throw new Error(err);
    }
  }
}

/**
 * @param {Array} messages
 * @param {Object} options
 * @param {number} options.severity
 * @param {boolean} [options.isOriginalMessageTypeObject]
 * @param {AbstractTransporter} transporter
 * @param {boolean} [transporter.json]
 * @param {Function} callback
 */
function writeToTransporter (messages, options, transporter, callback) {
  if (options.severity < transporter.severity.minimum || options.severity > transporter.severity.maximum) {
    return callback();
  }

  transporter.write(
    stringify(
      messages,
      {
        json: transporter.json,
        messageLength: transporter.messageLength,
        trace: transporter.trace,
        file: options.file,
        function: options.function
      }
    ),
    options,
    callback
  );
}

/**
 * @param {Highlogger} ctx
 * @param {Array} messages
 * @param {Object} options
 */
function log (ctx, messages, options) {
  let trace = stackTrace.get();

  options.file = trace[2].getFileName();
  options.function = trace[2].getFunctionName();

  if (messages.length === 1) {
    messages = messages[0];
  }

  async.each(ctx.transporters, writeToTransporter.bind(null, messages, options), ctx.errorHandler);
}

/**
 * @param {Object} [config]
 * @returns {Object}
 * @private
 */
function populateConfig (config) {
  let populatedConfig = {
    transporters: [{
      type: SHARED_CONSTANTS.TRANSPORTER.CONSOLE
    }],
    errorHandler: defaultErrorHandler,
    debugKeys: {
      include: [],
      exclude: []
    }
  };

  if (typeof config !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
    return populatedConfig;
  }

  if (config.transporters instanceof Array) {
    populatedConfig.transporters = config.transporters;
  }

  if (typeof config.errorHandler === SHARED_CONSTANTS.OBJECT_TYPE.FUNCTION) {
    populatedConfig.errorHandler = config.errorHandler;
  }

  if (typeof config.debugKeys === SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
    if (config.debugKeys.include instanceof Array) {
      populatedConfig.debugKeys.include = config.debugKeys.include;
    }

    if (config.debugKeys.exclude instanceof Array) {
      populatedConfig.debugKeys.exclude = config.debugKeys.exclude;
    }
  }

  return populatedConfig;
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
    let populatedConfig = populateConfig(config);
    this.errorHandler = populatedConfig.errorHandler;
    this.debugKeys = setupDebugKeys(populatedConfig.debugKeys);

    this.transporters = [];
    for (let t in populatedConfig.transporters) {
      /* istanbul ignore if*/
      if (!populatedConfig.transporters.hasOwnProperty(t)) {
        continue;
      }

      let transporterConfig = populatedConfig.transporters[t];
      if (typeof transporterConfig !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
        continue;
      }

      transporterConfig.errorHandler = this.errorHandler;

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

  emergency (message, options) {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.EMERG});
  }

  alert (message, options) {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.ALERT});
  }

  critical (message, options) {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.CRIT});
  }

  error (message, options) {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.ERROR});
  }

  warning (message, options) {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.WARN});
  }

  notice () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.NOTICE});
  }

  info () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.INFO});
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
     */
    return function debug () {
      log(self, arguments, {debugKey: debugKey, severity: SHARED_CONSTANTS.SEVERITY.DEBUG});
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