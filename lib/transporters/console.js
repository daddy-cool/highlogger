'use strict';

let Abstract = require('./abstract'),
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan', 'yellow', 'red', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan'],
    error = require('../helpers/error'),
    constants = require('../helpers/constants');

const EMPTY = '';
const SPACE = ' ';

/**
 * @class Console
 * @extends Abstract
 */
class Console extends Abstract {
  /**
   * @name Console#console
   * @type console.constructor
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
   */
  constructor (config) {
    super(config);

    this.setColors(config)
        .setConsoleSizeLimit();

    this.console = new console.constructor(process.stdout, process.stderr);
    this.contexts = {};
    this.textColorIndex = 0;
  }

  /**
   * @inheritdoc
   */
  setPrependContext (config) {
    super.setPrependContext(config);

    this.consolePrepentContext = this.prependContext;
    this.prependContext = false;

    return this;
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
   * @returns {Console}
   */
  setConsoleSizeLimit () {
    if (this.chalk.enabled) {
      this.sizeLimit -= 10;
    }

    return this;
  }

  /**
   * @inheritdoc
   */
  write (message, context, severity, callback) {
    let consoleContext = EMPTY;

    if (this.consolePrepentContext) {
      if (typeof this.contexts[context] === constants.TYPE_OF.UNDEFINED) {
        this.contexts[context] = this.chalk[textColors[this.textColorIndex++]](context);
        if (this.textColorIndex === textColors.length) {
          this.textColorIndex = 0;
        }
      }
      consoleContext = this.contexts[context] + SPACE;
    }

    if (severity <= 4) {
      this.console.error(consoleContext+ message);
    } else {
      this.console.log(consoleContext+ message);
    }

    callback();
  }
}

module.exports = Console;