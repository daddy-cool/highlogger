'use strict';

let Abstract = require('./abstract'),
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan', 'yellow', 'red', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan'],
    error = require('../helpers/error'),
    constants = require('../helpers/constants');

/**
 * @class Console
 * @extends Abstract
 */
class Console extends Abstract {
  /**
   * @name Console#console
   * @type console
   */
  /**
   * @name Console#contexts
   * @type object
   */
  /**
   * @name Console#textColorIndex
   * @type number
   * @default 0
   */

  /**
   * @inheritdoc
   * @property {console} console
   * @property {object} contexts
   * @property {number} textColorIndex
   * @property {chalk} chalk
   */
  constructor (config) {
    super(config);

    this.setColors(config);
    this.console = new console.constructor(process.stdout, process.stderr);
    this.contexts = {};
    this.textColorIndex = 0;
  }

  /**
   * @param {object} config
   * @param {boolean} [config.colors]
   * @returns {Console}
   * @throws {Error}
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
   * @inheritdoc
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
   * @inheritdoc
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