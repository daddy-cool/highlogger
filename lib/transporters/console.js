'use strict';

let AbstractTransporter = require('./abstract'),
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan', 'yellow', 'red', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan'],
    error = require('../helpers/error'),
    constants = require('../helpers/constants');

/**
 * @class Console
 * @extends AbstractTransporter
 */
class Console extends AbstractTransporter {

  /**
   * @param {Object} config
   */
  constructor (config) {
    super(config);

    this.setColors(config);

    this.console = new console.constructor(process.stdout, process.stderr);
    this.contexts = {};
    this.textColorIndex = 0;
  }

  /**
   * @param {Object} config
   * @param {Boolean} [config.colors]
   * @returns {Console}
   */
  setColors (config) {
    let colors = chalk.supportsColor;

    if (config.hasOwnProperty('colors')) {
      if (typeof config.colors !== constants.TYPE_OF.BOOLEAN) {
        throw new Error(error.config.invalidValue('colors'));
      }
      colors = config.colors;
    }

    this.chalk = new chalk.constructor({enabled: colors});

    return this;
  }

  /**
   * @param {*} message
   * @param {Number} severity
   * @param {String} context
   * @param {Function} callback
   */
  log (message, severity, context, callback) {
    let self = this;

    if (typeof self.contexts[context] === constants.TYPE_OF.UNDEFINED) {
      self.contexts[context] = self.chalk[textColors[self.textColorIndex++]](context);
      if (self.textColorIndex === textColors.length) {
        self.textColorIndex = 0;
      }
    }

    super.log(message, severity, self.contexts[context], callback);
  }

  /**
   * @param {String} message
   * @param {Number} severity
   * @param {Function} callback
   */
  write (message, severity, callback) {
    if (severity <= 4) {
      this.console.error(message);
    } else {
      this.console.log(message);
    }

    callback();
  }
}

module.exports = Console;