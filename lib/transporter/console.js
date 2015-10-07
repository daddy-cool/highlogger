'use strict';

let AbstractTransporter = require('./abstract'),
    NodeConsole = require('console').Console;

class Console extends AbstractTransporter {

  /**
   * @param {Object} [config]
   */
  constructor (config) {
    super(config);

    this.console = new NodeConsole(process.stdout, process.stderr);
  }

  /**
   * @param {string} message
   * @param {Object} options
   * @param {Function} callback
   */
  write (message, options, callback) {
    if (options.severity <= 4) {
      this.console.warn(message);
    } else {
      this.console.log(message);
    }

    callback();
  }
}

module.exports = Console;