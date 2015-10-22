'use strict';

let AbstractTransporter = require('./abstract'),
    NodeConsole = require('console').Console;

const SHARED_CONSTANTS = require('../shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;
const SPACE = ' ';

class Console extends AbstractTransporter {

  /**
   * @param {Object} config
   */
  constructor (config) {
    super(config);

    let outStream = process.stdout,
        errStream = process.stderr;

    if (typeof config.streams !== OBJECT_TYPE.UNDEFINED) {
      outStream = config.streams.output;
      errStream = config.streams.error;
    }

    this.console = new NodeConsole(outStream, errStream);
  }

  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {Function} callback
   */
  write (message, options, callback) {
    if (options.debugKey) {
      message = '\u001b[32m' + options.debugKey + '\u001b[39m' + SPACE + message;
    }

    if (options.severity <= 4) {
      this.console.error(message);
    } else {
      this.console.log(message);
    }

    callback();
  }
}

module.exports = Console;