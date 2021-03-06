'use strict';

let Transporters = require('./transporters'),
    Debug = require('./debug'),
    constants = require('./helpers/constants'),
    path = require('path');

const EMPTY = '';

/**
 * @class Highlogger
 */
class Highlogger {

  /**
   * @name Highlogger#emerg
   * @type {function}
   * @param {*} message
   */
  /**
   * @name Highlogger#alert
   * @type {function}
   * @param {*} message
   */
  /**
   * @name Highlogger#crit
   * @type {function}
   * @param {*} message
   */
  /**
   * @name Highlogger#error
   * @type {function}
   * @param {*} message
   */
  /**
   * @name Highlogger#warn
   * @type {function}
   * @param {*} message
   */
  /**
   * @name Highlogger#notice
   * @type {function}
   * @param {*} message
   */
  /**
   * @name Highlogger#info
   * @type {function}
   * @param {*} message
   */
  /**
   * @name Highlogger#getEmerg
   * @type {function}
   * @param {string} context
   * @returns {Highlogger#emerg}
   */
  /**
   * @name Highlogger#getAlert
   * @type {function}
   * @param {string} context
   * @returns {Highlogger#alert}
   */
  /**
   * @name Highlogger#getCrit
   * @type {function}
   * @param {string} context
   * @returns {Highlogger#crit}
   */
  /**
   * @name Highlogger#getError
   * @type {function}
   * @param {string} context
   * @returns {Highlogger#error}
   */
  /**
   * @name Highlogger#getWarn
   * @type {function}
   * @param {string} context
   * @returns {Highlogger#warn}
   */
  /**
   * @name Highlogger#getNotice
   * @type {function}
   * @param {string} context
   * @returns {Highlogger#notice}
   */
  /**
   * @name Highlogger#getInfo
   * @type {function}
   * @param {string} context
   * @returns {Highlogger#info}
   */

  /**
   * @returns {string}
   */
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

    Highlogger._instance = this;
  }

  /**
   * @param config
   * @return {Highlogger};
   */
  reload (config) {
    this.transporters = new Transporters(config);

    return this;
  }

  /**
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
   * @param {object} [config]
   * @returns {Highlogger}
   */
  static getInstance (config) {
    if (Highlogger._instance instanceof Highlogger) {
      return Highlogger._instance;
    }

    return new Highlogger(config);
  }
}

module.exports = Highlogger;