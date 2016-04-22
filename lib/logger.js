'use strict';

let async = require('async'),
    currentInstance,
    transporters = require('./transporters'),
    common = require('./common');

/**
 * @param {Arguments} messages
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
 * @param {Arguments} messages
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
    )
  );
}

/**
 * @param {Object} [config]
 * @returns {Object}
 * @private
 */
function populateConfig (config) {
  let populatedConfig = [{type: 'console'}];

  if (config instanceof Array) {
    populatedConfig = config;
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

      debugKey = debugKey.trim();
      if (debugKey.length === 0) {
        continue;
      }

      if (debugKey.charAt(0) === '-') {
        debugKey = debugKey.substring(1);
        excludeKeys.push(new RegExp('^' + debugKey.replace(/\*/g, '.*?') + '$'));
      } else {
        includeKeys.push(new RegExp('^' + debugKey.replace(/\*/g, '.*?') + '$'));
      }
    }
  }

  return {include: includeKeys, exclude: excludeKeys};
}

/**
 * @param {object} [config]
 */
function validateConfig (config) {
  if (config === null || typeof config === common.constants.TYPE_OF.UNDEFINED) {
    return;
  }

  if (typeof config !== common.constants.TYPE_OF.OBJECT) {
    throw new Error(common.error.config.invalid());
  }

  for (let transporterName in config) {
    if (!config.hasOwnProperty(transporterName)) {
      continue;
    }

    /**
     * @type {object}
     * @property {string} [fallback]
     */
    let transporterConfig = config[transporterName];

    if (!transporters.isTransporterType(transporterConfig.type)) {
      throw new Error(common.error.config.invalidValue(transporterName, 'type'));
    }

    if (transporterConfig.hasOwnProperty('fallback') && !config.hasOwnProperty(transporterConfig.fallback)) {
      throw new Error(common.error.config.invalidValue(transporterName, 'fallback'));
    }

    transporters.getTransporterType(transporterConfig.type).validateConfig(transporterName, transporterConfig);
  }
}

/**
 * @class Highlogger
 */
class Logger {

  /**
   * @param {object} [config]
   */
  constructor (config) {
    validateConfig(config);
    this.config = config;

    /*

    let populatedConfig = populateConfig(config),
        transportersIterator = populatedConfig.length;

    this.debugKeys = setupDebugKeys();
    this.transporters = [];

    while (transportersIterator--) {
      let transporterConfig = populatedConfig[transportersIterator];
      if (typeof transporterConfig === common.constants.OBJECT_TYPE.OBJECT && transporterConfig !== null) {
        this.addTransporter(transporterConfig);
      }
    }

    currentInstance = this;
    */
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
        throw new Error('unsupported transporter');
    }
  }

  /**
   * @param {...*}
   */
  emerg () {
    log(this, arguments, {severity: common.constants.SEVERITY.emerg});
  }

  /**
   * @param {...*}
   */
  alert () {
    log(this, arguments, {severity: common.constants.SEVERITY.alert});
  }

  /**
   * @param {...*}
   */
  crit () {
    log(this, arguments, {severity: common.constants.SEVERITY.crit});
  }

  /**
   * @param {...*}
   */
  error () {
    log(this, arguments, {severity: common.constants.SEVERITY.error});
  }

  /**
   * @param {...*}
   */
  warn () {
    log(this, arguments, {severity: common.constants.SEVERITY.warn});
  }

  /**
   * @param {...*}
   */
  notice () {
    log(this, arguments, {severity: common.constants.SEVERITY.notice});
  }

  /**
   * @param {...*}
   */
  info () {
    log(this, arguments, {severity: common.constants.SEVERITY.info});
  }

  /**
   * @param {...*}
   */
  debug () {
    log(this, arguments, {severity: common.constants.SEVERITY.debug});
  }

  /**
   *
   * @param {string} [debugKey]
   * @returns {Highlogger~debugWithKey}
   */
  getDebug (debugKey) {
    let self = this,
        excluded = false,
        included = false;

    if (typeof debugKey !== common.constants.OBJECT_TYPE.STRING) {
      return function missingDebugKey () {};
    }

    self.debugKeys.exclude.forEach(function isExcludedFn (excludeKey) {
      if (excludeKey.test(debugKey)) {
        excluded = true;
      }
    });

    if (excluded) {
      return function excludedDebugKey () {};
    }

    self.debugKeys.include.forEach(function isIncludedFn (includeKey) {
      if (includeKey.test(debugKey)) {
        included = true;
      }
    });

    if (!included) {
      return function notIncludedDebugKey () {};
    }

    /**
     * @param {...*}
     * @callback Highlogger~debugWithKey
     */
    return function debugWithKey () {
      log(self, arguments, {debugKey: debugKey, severity: common.constants.SEVERITY.debug});
    };
  }

  /**
   * @returns {Highlogger}
   */
  static getInstance () {
    if (typeof currentInstance !== common.constants.OBJECT_TYPE.UNDEFINED) {
      return currentInstance;
    }

    throw new Error('Highlogger needs to be instanced at least once');
  }
}

module.exports = Logger;