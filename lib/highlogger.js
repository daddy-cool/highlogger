'use strict';

let instance,
    Transporters = require('./transporters'),
    Debug = require('./debug'),
    constants = require('../helpers/constants'),
    path = require('path'),
    error = require('../helpers/error');

const EMPTY = '';

function emptyDebug () {}

function getContext () {
  let err = new Error();
  Error.prepareStackTrace = function prepareStackTrace (e, stack) {
    return stack;
  };

  //noinspection JSUnresolvedFunction
  return err.stack[2].getFileName().replace(path.dirname(require.main.filename) + path.sep, EMPTY);
}

/**
 * @class Highlogger
 */
class Highlogger {

  /**
   * @param {object} [config]
   */
  constructor (config) {
    this.transporters = new Transporters(config);
    this.debugManager = new Debug();

    instance = this;
  }

  /**
   * @param {...*}
   */
  emerg () {
    this.transporters.write(arguments, constants.SEVERITY.emerg, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~emergWithContext}
   */
  getEmerg (context) {
    let self = this;

    /**
     * @param {...*}
     * @callback Highlogger~emergWithContext
     */
    return function emergWithContext () {
      self.transporters.write(arguments, constants.SEVERITY.emerg, context);
    };
  }

  /**
   * @param {...*}
   */
  alert () {
    this.transporters.write(arguments, constants.SEVERITY.alert, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~alertWithContext}
   */
  getAlert (context) {
    let self = this;

    /**
     * @param {...*}
     * @callback Highlogger~alertWithContext
     */
    return function alertWithContext () {
      self.transporters.write(arguments, constants.SEVERITY.alert, context);
    };
  }

  /**
   * @param {...*}
   */
  crit () {
    this.transporters.write(arguments, constants.SEVERITY.crit, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~critWithContext}
   */
  getCrit (context) {
    let self = this;

    /**
     * @param {...*}
     * @callback Highlogger~critWithContext
     */
    return function critWithContext () {
      self.transporters.write(arguments, constants.SEVERITY.crit, context);
    };
  }

  /**
   * @param {...*}
   */
  error () {
    this.transporters.write(arguments, constants.SEVERITY.error, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~errorWithContext}
   */
  getError (context) {
    let self = this;

    /**
     * @param {...*}
     * @callback Highlogger~errorWithContext
     */
    return function errorWithContext () {
      self.transporters.write(arguments, constants.SEVERITY.error, context);
    };
  }

  /**
   * @param {...*}
   */
  warn () {
    this.transporters.write(arguments, constants.SEVERITY.warn, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~warnWithContext}
   */
  getWarn (context) {
    let self = this;

    /**
     * @param {...*}
     * @callback Highlogger~warnWithContext
     */
    return function warnWithContext () {
      self.transporters.write(arguments, constants.SEVERITY.warn, context);
    };
  }

  /**
   * @param {...*}
   */
  notice () {
    this.transporters.write(arguments, constants.SEVERITY.notice, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~noticeWithContext}
   */
  getNotice (context) {
    let self = this;

    /**
     * @param {...*}
     * @callback Highlogger~noticeWithContext
     */
    return function noticeWithContext () {
      self.transporters.write(arguments, constants.SEVERITY.notice, context);
    };
  }

  /**
   * @param {...*}
   */
  info () {
    this.transporters.write(arguments, constants.SEVERITY.info, getContext());
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~infoWithContext}
   */
  getInfo (context) {
    let self = this;

    /**
     * @param {...*}
     * @callback Highlogger~infoWithContext
     */
    return function infoWithContext () {
      self.transporters.write(arguments, constants.SEVERITY.info, context);
    };
  }

  /**
   * @param {...*}
   */
  debug () {
    this.getDebug(getContext()).apply(this, arguments);
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~debugWithContext}
   */
  getDebug (context) {
    let self = this;

    if (this.debugManager.isDebug(context)) {
      /**
       * @param {...*}
       * @callback Highlogger~debugWithContext
       */
      return function debugWithContext () {
        self.transporters.write(arguments, constants.SEVERITY.debug, context);
      };
    }

    return emptyDebug;
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