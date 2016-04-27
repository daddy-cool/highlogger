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
    this.stringify = new Stringify({json: true});
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
    let self = this;

    if (typeof self.contexts[context] === constants.TYPE_OF.UNDEFINED) {
      self.contexts[context] = self.chalk[textColors[self.textColorIndex++]](context) + SPACE;
      if (self.textColorIndex === textColors.length) {
        self.textColorIndex = 0;
      }
    }

    this.stringify.stringify(messages, function consoleStringify (message) {
      if ((self.contexts[context] + message).length <= self.sizeLimit) {
        return self.log(self.contexts[context] + message, severity, callback);
      }

      if (!self.fallback) {
        return self.log(`${self.contexts[context]} message exceeded sizeLimit of '${self.sizeLimit}' and no fallback was found`, severity, callback);
      }

      self.fallback.write(messages, severity, context, function writeCb (a, b) {
        self.log(`${self.contexts[context]} message exceeded sizeLimit of '${self.sizeLimit}'.${typeof b !== constants.TYPE_OF.UNDEFINED ? ' ' + b : ''}`, severity, callback);
      });
    });
  }

  /**
   * @param {string} message
   * @param {number} severity
   * @param {Function} callback
   */
  log (message, severity, callback) {
    if (severity <= 4) {
      this.console.error(message);
    } else {
      this.console.log(message);
    }

    callback(null, "blub");
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