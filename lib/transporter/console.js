"use strict";

let AbstractTransporter = require('./abstract-transporter'),
    NodeConsole = require('console').Console,
    sharedConstants = require('../shared-constants'),
    SEVERITY = sharedConstants.SEVERITY;

class Console extends AbstractTransporter {

  constructor (config) {
    super(config);

    this.console = new NodeConsole(process.stdout, process.stderr);
  }

  log (message, options, callback) {
    if (options.severity <= 4) {
      this.console.warn(message);
    } else {
      this.console.log(message);
    }

    callback();
  }


}

module.exports = Console;