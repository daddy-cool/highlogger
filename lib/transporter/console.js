"use strict";

let ConsoleClass = require('console').Console,
    sharedConstants = require('../shared-constants'),
    SEVERITY = sharedConstants.SEVERITY;

class Console {

  constructor (config) {
    this.console = new ConsoleClass(process.stdout, process.stderr);

    this.setSeverityLevel(config.severityLevel);
  }

  setSeverityLevel (severityLevel) {
    this.severityLevel = (typeof severityLevel === 'number') ? severityLevel : SEVERITY.NOTICE;
  }

  log (options, callback) {
    if (typeof options.severity !== 'number') {
      options.severity = SEVERITY.NOTICE;
    }

    if (options.severity < this.severityLevel) {
      return callback();
    }

    if (options.severity <= 4) {
      this.console.warn(options.message);
    } else {
      this.console.log(options.message);
    }

    callback();
  }


}

module.exports = Console;