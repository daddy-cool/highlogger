'use strict';

let AbstractTransporter = require('./abstract'),
    nodeConsole = console,
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan', 'yellow', 'red', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan'],
    error = require('../helpers/error'),
    constants = require('../helpers/constants');

class Console extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {boolean} [config.colors]
   */
  constructor (config) {
    super(config);

    //noinspection JSUnresolvedFunction
    this.chalk = new chalk.constructor({enabled: typeof config.colors === constants.TYPE_OF.BOOLEAN ? config.colors : chalk.supportsColor});
    this.contexts = {};
    this.textColorIndex = 0;
  }

  /**
   * @param {Array} messages
   * @param {number} severity
   * @param {string} context
   * @param {Function} callback
   */
  write (messages, severity, context, callback) {
    if (typeof this.contexts[context] === constants.TYPE_OF.UNDEFINED) {
      this.contexts[context] = this.chalk[textColors[this.textColorIndex++]](context);
      if (this.textColorIndex === textColors.length) {
        this.textColorIndex = 0;
      }
    }

    messages = Array.prototype.slice.call(messages);
    messages.unshift(this.contexts[context]);

    if (severity <= 4) {
      nodeConsole.error.apply(null, messages);
    } else {
      nodeConsole.log.apply(null, messages);
    }

    callback();
  }

  /**
   * @param {object} config
   * @param {boolean} [config.colors]
   */
  static validate (config) {
    super.validate(config);

    if (config.hasOwnProperty('colors') && typeof config.colors !== constants.TYPE_OF.BOOLEAN) {
      throw new Error(error.config.invalidValue('colors'));
    }
  }
}

module.exports = Console;