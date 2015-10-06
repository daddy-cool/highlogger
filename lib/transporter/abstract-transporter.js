'use strict';

class AbstractTransporter {
  constructor (config) {
    this.setSeverityLevel(config.severityLevel);
  }

  setSeverityLevel (severityLevel) {
    this.severityLevel = (typeof severityLevel === 'number') ? severityLevel : SEVERITY.NOTICE;

    return this;
  }

  log (message, options, callback) {
    callback(new Error('AbstractTransporter log-method must be overwritten!'));
  }
}

module.exports = AbstractTransporter;