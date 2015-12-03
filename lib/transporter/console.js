'use strict';

let AbstractTransporter = require('./abstract'),
    NodeConsole = require('console').Console,
    stringify = require('../stringify'),
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan'];

const SHARED_CONSTANTS = require('../shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;
const SPACE = ' ';
const EMPTY = '';

class Console extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {Function} config.errorHandler;
   * @param {Object} [config.severity]
   * @param {boolean} [config.json]
   * @param {boolean} [config.colors]
   * @param {number} [config.maxMessageSize]
   * @param {Stream} [config.stream]
   */
  constructor (config) {
    super(config);
    this.chalk = new chalk.constructor({enabled: typeof config.colors === OBJECT_TYPE.BOOLEAN ? config.colors : true});

    this.console = new NodeConsole(config.stream || process.stdout);
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

    if (options.severity === SHARED_CONSTANTS.SEVERITY.debug && typeof options.debugKey === OBJECT_TYPE.STRING) {
      msgPrefix = options.debugKey;
      if (typeof this.debugKeys[options.debugKey] !== OBJECT_TYPE.UNDEFINED) {
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
      message = msgPrefix + this.chalk.red(stringify(msg, this.json, this.maxMessageSize - (msgPrefix.length + 10)));
    } else if (options.severity === 4) {
      message = msgPrefix + this.chalk.yellow(stringify(msg, this.json, this.maxMessageSize - (msgPrefix.length + 10)));
    } else {
      message = msgPrefix + stringify(msg, this.json, this.maxMessageSize - msgPrefix.length);
    }

    this.console.log(message);
    callback();
  }
}

module.exports = Console;