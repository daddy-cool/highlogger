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
   * @inheritdoc
   */
  constructor (config) {
    super(config);

    /**
     * @type {boolean}
     */
    this.consoleUseContext = this.useContext;
    /**
     * @type {console.constructor}
     */
    this.console = new console.constructor(process.stdout, process.stderr);
    /**
     * @type {object}
     */
    this.contexts = {};
    /**
     * @type {number}
     */
    this.textColorIndex = 0;
    /**
     * @type {chalk.constructor}
     */
    this.chalk = new chalk.constructor({enabled: chalk.supportsColor});

    this.useContext = false;
    this.setColors();
    if (this.chalk.enabled) {
      this.sizeLimit -= 10;
    }
  }

  /**
   * @returns {Console}
   * @throws {TypeError}
   */
  setColors () {
    if (this.config.hasOwnProperty('colors')) {
      if (typeof this.config.colors !== constants.TYPE_OF.BOOLEAN) {
        throw new TypeError(error.config.invalidValue('colors'));
      }
      this.chalk = new chalk.constructor({enabled: this.config.colors});
    }

    return this;
  }

  /**
   * @inheritdoc
   */
  write (message, context, severity, callback) {
    let consoleContext = EMPTY;

    if (this.consoleUseContext) {
      if (typeof this.contexts[context] === constants.TYPE_OF.UNDEFINED) {
        this.contexts[context] = this.chalk[textColors[this.textColorIndex++]](context);
        if (this.textColorIndex === textColors.length) {
          this.textColorIndex = 0;
        }
      }
      consoleContext = this.contexts[context] + SPACE;
    }

    if (severity <= 4) {
      this.console.error(consoleContext + message);
    } else {
      this.console.log(consoleContext + message);
    }

    callback();
  }
}

module.exports = Console;