'use strict';

let AbstractTransporter = require('./abstract'),
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan', 'yellow', 'red', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan'],
    error = require('../helpers/error'),
    Stringify = require('../helpers/stringify'),
    constants = require('../helpers/constants');

const SPACE = ' ';

class Console extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {boolean} [config.colors]
   */
  constructor (config) {
    super(config);

    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    this.console = new console.Console(process.stdout, process.stderr);
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    this.chalk = new chalk.constructor({enabled: typeof config.colors === constants.TYPE_OF.BOOLEAN ? config.colors : chalk.supportsColor});
    //noinspection JSUnresolvedVariable
    this.stringify = new Stringify().stringify;
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
    let message = this.stringify(messages);

    if (typeof this.contexts[context] === constants.TYPE_OF.UNDEFINED) {
      this.contexts[context] = this.chalk[textColors[this.textColorIndex++]](context) + SPACE;
      if (this.textColorIndex === textColors.length) {
        this.textColorIndex = 0;
      }
    }

    if ((this.contexts[context] + message).length > this.sizeLimit) {
      if (this.fallback) {
        let self = this;
        this.fallback.write(messages, severity, context, function writeCb (a) {
          self.log(`message exceeded sizeLimit of '${self.sizeLimit}'. ${a}`, severity, callback);
        });
      } else {
        this.log(`message exceeded sizeLimit of '${this.sizeLimit}' and no fallback was found`, severity, callback);
      }
    } else {
      this.log(message, severity, callback);
    }
  }

  log (message, severity, callback) {
    if (severity <= 4) {
      this.console.error(message);
    } else {
      this.console.log(message);
    }

    callback("blub");
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