'use strict';

let instance,
    transporters = require('./transporters'),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    emptyDebug = function emptyDebug () {};


function setupDebugKeys () {
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

function getContext () {
  let err = new Error();
  Error.prepareStackTrace = function prepareStackTrace (e, stack) {
    return stack;
  };

  //noinspection JSUnresolvedFunction
  return err.stack[2].getFileName();
}

/**
 * @class Highlogger
 */
class Highlogger {

  /**
   * @param {object} [config]
   */
  constructor (config) {
    transporters.addTransporters(config);

    //this.debugKeys = setupDebugKeys();

    instance = this;
  }

  /**
   * @param {...*}
   */
  emerg () {
    transporters.write(arguments, constants.SEVERITY.emerg, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~emergWithContext}
   */
  getEmerg (context) {
    /**
     * @param {...*}
     * @callback Highlogger~emergWithContext
     */
    return function emergWithContext () {
      transporters.write(arguments, constants.SEVERITY.emerg, context);
    };
  }

  /**
   * @param {...*}
   */
  alert () {
    transporters.write(arguments, constants.SEVERITY.alert, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~alertWithContext}
   */
  getAlert (context) {
    /**
     * @param {...*}
     * @callback Highlogger~alertWithContext
     */
    return function alertWithContext () {
      transporters.write(arguments, constants.SEVERITY.alert, context);
    };
  }

  /**
   * @param {...*}
   */
  crit () {
    transporters.write(arguments, constants.SEVERITY.crit, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~critWithContext}
   */
  getCrit (context) {
    /**
     * @param {...*}
     * @callback Highlogger~critWithContext
     */
    return function critWithContext () {
      transporters.write(arguments, constants.SEVERITY.crit, context);
    };
  }

  /**
   * @param {...*}
   */
  error () {
    transporters.write(arguments, constants.SEVERITY.error, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~errorWithContext}
   */
  getError (context) {
    /**
     * @param {...*}
     * @callback Highlogger~errorWithContext
     */
    return function errorWithContext () {
      transporters.write(arguments, constants.SEVERITY.error, context);
    };
  }

  /**
   * @param {...*}
   */
  warn () {
    transporters.write(arguments, constants.SEVERITY.warn, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~warnWithContext}
   */
  getWarn (context) {
    /**
     * @param {...*}
     * @callback Highlogger~warnWithContext
     */
    return function warnWithContext () {
      transporters.write(arguments, constants.SEVERITY.warn, context);
    };
  }

  /**
   * @param {...*}
   */
  notice () {
    transporters.write(arguments, constants.SEVERITY.notice, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~noticeWithContext}
   */
  getNotice (context) {
    /**
     * @param {...*}
     * @callback Highlogger~noticeWithContext
     */
    return function noticeWithContext () {
      transporters.write(arguments, constants.SEVERITY.notice, context);
    };
  }

  /**
   * @param {...*}
   */
  info () {
    transporters.write(arguments, constants.SEVERITY.info, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~infoWithContext}
   */
  getInfo (context) {
    /**
     * @param {...*}
     * @callback Highlogger~infoWithContext
     */
    return function infoWithContext () {
      transporters.write(arguments, constants.SEVERITY.info, context);
    };
  }

  /**
   * @param {...*}
   */
  debug () {
    this.getDebug(getContext()).apply(arguments);
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~debugWithContext}
   */
  getDebug (context) {
    let excluded = false,
        included = false;

    this.debugKeys.exclude.forEach(function isExcludedFn (excludeKey) {
      if (excludeKey.test(context)) {
        excluded = true;
      }
    });
    if (excluded) {
      return emptyDebug;
    }

    this.debugKeys.include.forEach(function isIncludedFn (includeKey) {
      if (includeKey.test(context)) {
        included = true;
      }
    });
    if (!included) {
      return emptyDebug;
    }

    /**
     * @param {...*}
     * @callback Highlogger~debugWithContext
     */
    return function debugWithContext () {
      transporters.write(arguments, constants.SEVERITY.debug, context);
    };
  }

  /**
   * @returns {Highlogger}
   */
  static getInstance () {
    if (typeof instance !== constants.TYPE_OF.UNDEFINED) {
      return instance;
    }

    throw new Error(error.general.notInstanced());
  }
}

module.exports = Highlogger;