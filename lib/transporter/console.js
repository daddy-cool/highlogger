'use strict';

let AbstractTransporter = require('./abstract'),
    NodeConsole = require('console').Console,
    chalk = require('chalk'),
    textColors = ['green', 'blue', 'magenta', 'cyan'];

const SHARED_CONSTANTS = require('../shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;
const SPACE = ' ';

class Console extends AbstractTransporter {

  /**
   * @param {Object} config
   */
  constructor (config) {
    super(config);

    this.colors = (typeof config.colors === OBJECT_TYPE.BOOLEAN) ? config.colors : true;
    if (this.colors) {
      this.chalk = new chalk.constructor({enabled: true});
    }
    this.console = new NodeConsole(config.stream || process.stdout);
    this.debugKeys = {};
    this.textColorIndex = 0;
  }

  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {Function} callback
   */
  write (message, options, callback) {
    let debug = options.severity === SHARED_CONSTANTS.SEVERITY.DEBUG && typeof options.debugKey === OBJECT_TYPE.STRING,
        debugKey = options.debugKey + '';

    if (this.colors) {
      if (options.severity <= 3) {
        message = this.chalk.red(message);
      } else if (options.severity === 4) {
        message = this.chalk.yellow(message);
      }

      if (debug) {
        if (this.debugKeys[debugKey]) {
          debugKey = this.debugKeys[debugKey];
        } else {
          let color = textColors[this.textColorIndex];

          debugKey = this.chalk[color](debugKey);
          this.debugKeys[debugKey] = debugKey;

          this.textColorIndex++;
          if (this.textColorIndex === textColors.length) {
            this.textColorIndex = 0;
          }
        }
      }
    }

    if (debug) {
      message = debugKey + SPACE + message;
    }

    this.console.log(message);
    callback();
  }
}

module.exports = Console;