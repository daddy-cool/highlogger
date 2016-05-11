'use strict';

let instance,
    Transporters = require('./transporters'),
    Debug = require('./debug'),
    constants = require('./helpers/constants'),
    path = require('path'),
    error = require('./helpers/error');

const EMPTY = '';

/**
 * @class Highlogger
 */
class Highlogger {

  getContext () {
    let err = new Error(),
        context,
        originalStackTrace = Error.prepareStackTrace;

    Error.prepareStackTrace = function prepareStackTrace (e, stack) {
      return stack;
    };

    //noinspection JSUnresolvedFunction
    context = err.stack[2].getFileName().replace(path.dirname(require.main.filename) + path.sep, EMPTY);
    Error.prepareStackTrace = originalStackTrace;
    return context;
  }

  /**
   * @param {object} [config]
   */
  constructor (config) {
    let self = this;

    this.transporters = new Transporters(config);
    this.debugManager = new Debug();

    for (let severity in constants.SEVERITY) {
      if (!constants.SEVERITY.hasOwnProperty(severity) || constants.SEVERITY[severity] === constants.SEVERITY.debug) {
        continue;
      }

      /**
       * @param {*} message
       */
      this[severity] = function log (message) {
        self.transporters.write(message, constants.SEVERITY[severity], self.getContext());
      };

      /**
       * @param {string} context
       */
      this['get' + severity.charAt(0).toUpperCase() + severity.slice(1)] = function getLog (context) {
        /**
         * @param {*} message
         */
        return function logWithContext (message) {
          self.transporters.write(message, constants.SEVERITY[severity], context);
        };
      };
    }

    instance = this;
  }

  /**
   *
   * @param {string} context
   * @returns {Highlogger~debugWithContext || Highlogger~emptyDebug}
   */
  getDebug (context) {
    let self = this;

    if (!this.debugManager.isDebug(context)) {
      /**
       * @param {*} message
       * @callback Highlogger~emptyDebug
       */
      return function emptyDebug () {};
    }

    /**
     * @param {*} message
     * @callback Highlogger~debugWithContext
     */
    return function debugWithContext (message) {
      self.transporters.write(message, constants.SEVERITY.debug, context);
    };
  }

  /**
   * @param {*} message
   */
  debug (message) {
    this.getDebug(this.getContext())(message);
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