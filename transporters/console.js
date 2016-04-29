'use strict';

let AbstractTransporter = require('./abstract'),
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan', 'yellow', 'red', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan'],
    error = require('../helpers/error'),
    Stringify = require('../helpers/stringify'),
    constants = require('../helpers/constants');

class Console extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {boolean} [config.colors]
   */
  constructor (config) {
    super(config);
    this.validate(config);

    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    this.chalk = new chalk.constructor({enabled: typeof config.colors === constants.TYPE_OF.BOOLEAN ? config.colors : chalk.supportsColor});
    //noinspection JSUnresolvedVariable
    this.stringify = new Stringify(config);
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
      self.contexts[context] = self.chalk[textColors[self.textColorIndex++]](context);
      if (self.textColorIndex === textColors.length) {
        self.textColorIndex = 0;
      }
    }

    this.stringify.stringify(this.contexts[context], messages, function consoleStringify (message) {
      if (message.length <= self.sizeLimit) {
        return self.log(message, severity, callback);
      }

      if (!self.fallback) {
        return self.stringify.stringify(
          self.contexts[context],
          [error.transporter.exceededSizeLimit(self.sizeLimit)],
          function stringifyFallback (message2) {
            self.log(message2, severity, callback);
          }
        );
      }

      self.fallback.write(messages, severity, context, function writeCb (e, fallbackMessage) {
        let payload = [error.transporter.exceededSizeLimit(self.sizeLimit)];
        if (typeof fallbackMessage !== constants.TYPE_OF.UNDEFINED) {
          payload.push(fallbackMessage);
        }
        self.stringify.stringify(
          self.contexts[context],
          payload,
          function stringifyFallback (message3) {
            self.log(message3, severity, callback);
          }
        );
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
      process.stdout.write(message);
    } else {
      process.stderr.write(message);
    }

    callback();
  }

  /**
   * @param {object} config
   * @param {boolean} [config.colors]
   */
  validate (config) {
    if (config.hasOwnProperty('colors') && typeof config.colors !== constants.TYPE_OF.BOOLEAN) {
      throw new Error(error.config.invalidValue('colors'));
    }
  }
}

module.exports = Console;