'use strict';

let AbstractTransporter = require('./abstract'),
    nodeConsole = console,
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan'],
    error = require('../helpers/error'),
    constants = require('../helpers/constants');

const SPACE = ' ';
const EMPTY = '';

/**
 * @namespace Transporters
 */
class Console extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {Object} [config.severity]
   * @param {boolean} [config.colors]
   * @param {number} [config.maxMessageSize]
   * @param {Stream} [config.stream]
   */
  constructor (config) {
    super(config);

    //noinspection JSUnresolvedFunction
    this.chalk = new chalk.constructor({enabled: typeof config.colors === constants.TYPE_OF.BOOLEAN ? config.colors : true});

    this.debugKeys = {};
    this.textColorIndex = 0;
  }

  /**
   * @param {*} msg
   * @param {Object} [options]
   * @param {Function} callback
   */
  write (msg, options, callback) {
    let msgPrefix = EMPTY,
        message;

    if (options.severity === constants.SEVERITY.debug && typeof options.debugKey === constants.TYPE_OF.STRING) {
      msgPrefix = options.debugKey;
      if (typeof this.debugKeys[options.debugKey] !== constants.TYPE_OF.UNDEFINED) {
        msgPrefix = this.debugKeys[options.debugKey];
      } else {
        let color = textColors[this.textColorIndex];

        msgPrefix = this.chalk[color](options.debugKey);
        this.debugKeys[options.debugKey] = msgPrefix;

        this.textColorIndex++;
        if (this.textColorIndex === textColors.length) {
          this.textColorIndex = 0;
        }
      }
      msgPrefix += SPACE;
    }

    if (options.severity <= 3) {
      message = msgPrefix + this.chalk.red(this.stringify.stringify(msg, this.json, this.maxMessageSize - (msgPrefix.length + 10)));
    } else if (options.severity === 4) {
      message = msgPrefix + this.chalk.yellow(this.stringify.stringify(msg, this.json, this.maxMessageSize - (msgPrefix.length + 10)));
    } else {
      message = msgPrefix + this.stringify.stringify(msg, this.json, this.maxMessageSize - msgPrefix.length);
    }

    nodeConsole.log(message);
    callback();
  }

  /**
   * @param {string} name
   * @param {object} config
   * @param {boolean} [config.colors]
   */
  static validate (name, config) {
    super.validate(name, config);

    if (config.hasOwnProperty('colors') && typeof config.colors !== constants.TYPE_OF.BOOLEAN) {
      throw new Error(error.config.invalidValue(name, 'colors'));
    }
  }
}

module.exports = Console;