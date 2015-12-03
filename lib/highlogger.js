'use strict';

let async = require('async'),
    Console = require('./transporter/console'),
    Socket = require('./transporter/socket'),
    Syslog = require('./transporter/syslog'),
    currentInstance;

const SHARED_CONSTANTS = require('./shared-constants');

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

  transporter.write(messages, options, callback);
}

/**
 * @param {Highlogger} ctx
 * @param {Array} messages
 * @param {Object} options
 */
function log (ctx, messages, options) {
  if (messages.length === 0) {
    return;
  }

  async.each(
    ctx.transporters,
    writeToTransporter.bind(
      null,
      messages.length === 1 ? messages[0] : messages,
      options
    ),
    ctx.errorHandler
  );
}

/**
 * @param {Object} [config]
 * @returns {Object}
 * @private
 */
function populateConfig (config) {
  let populatedConfig = {
    transporters: [{
      type: 'console'
    }],
    errorHandler: defaultErrorHandler
  };

  if (typeof config !== SHARED_CONSTANTS.OBJECT_TYPE.OBJECT || config === null) {
    return populatedConfig;
  }

  if (config.transporters instanceof Array) {
    populatedConfig.transporters = config.transporters;
  }

  if (typeof config.errorHandler === SHARED_CONSTANTS.OBJECT_TYPE.FUNCTION) {
    populatedConfig.errorHandler = config.errorHandler;
  }

  return populatedConfig;
}


function setupDebugKeys () {
  //noinspection JSUnresolvedVariable
  let includeKeys = [],
      excludeKeys = [],
      debug = process.env.DEBUG;

  if (debug) {
    let debugKeys = debug.split(','),
        debugKeysIterator = debugKeys.length;

    while (debugKeysIterator--) {
      let debugKey = debugKeys[debugKeysIterator];

      if (typeof debugKey !== SHARED_CONSTANTS.OBJECT_TYPE.STRING || debugKey.length === 0) {
        return;
      }

      if (debugKey.charAt(0) === '-') {
        excludeKeys.push(new RegExp('^' + debugKey.replace(/\*/g, '.*?') + '$'));
      } else {
        includeKeys.push(new RegExp('^' + debugKey.replace(/\*/g, '.*?') + '$'));
      }
    }
  }

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
    let populatedConfig = populateConfig(config),
        transportersIterator = populatedConfig.transporters.length;

    this.errorHandler = populatedConfig.errorHandler;
    this.debugKeys = setupDebugKeys(populatedConfig.debugKeys);
    this.transporters = [];

    while (transportersIterator--) {
      let transporterConfig = populatedConfig.transporters[transportersIterator];
      if (typeof transporterConfig === SHARED_CONSTANTS.OBJECT_TYPE.OBJECT) {
        transporterConfig.errorHandler = this.errorHandler;
        this.addTransporter(transporterConfig);
      }
    }

    currentInstance = this;
  }

  /**
   * @param {Object} transporterConfig
   */
  addTransporter (transporterConfig) {
    switch (transporterConfig.type) {
      case 'console':
        this.transporters.push(new Console(transporterConfig));
        break;
      case 'socket':
        this.transporters.push(new Socket(transporterConfig));
        break;
      case 'syslog':
        this.transporters.push(new Syslog(transporterConfig));
        break;
      default:
        transporterConfig.errorHandler(new Error('unsupported transporter'));
    }
  }

  /**
   * @param {...*}
   */
  emerg () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.emerg});
  }

  /**
   * @param {...*}
   */
  alert () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.alert});
  }

  /**
   * @param {...*}
   */
  crit () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.crit});
  }

  /**
   * @param {...*}
   */
  error () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.error});
  }

  /**
   * @param {...*}
   */
  warn () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.warn});
  }

  /**
   * @param {...*}
   */
  notice () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.notice});
  }

  /**
   * @param {...*}
   */
  info () {
    log(this, arguments, {severity: SHARED_CONSTANTS.SEVERITY.info});
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
      return function missingDebugKey () {};
    }

    self.debugKeys.exclude.forEach(function isExcludedFn (excludeKey) {
      if (excludeKey.test(debugKey)) {
        excluded = true;
      }
    });

    if (excluded) {
      return function excludedDebug () {};
    }

    self.debugKeys.include.forEach(function isIncludedFn (includeKey) {
      if (includeKey.test(debugKey)) {
        included = true;
      }
    });

    if (!included) {
      return function notIncludedDebug () {};
    }

    /**
     * @param {...*}
     * @callback Highlogger~debug
     */
    return function debug () {
      log(self, arguments, {debugKey: debugKey, severity: SHARED_CONSTANTS.SEVERITY.debug});
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

module.exports = Highlogger;