"use strict";

let sharedConstants = require('../shared-constants'),
    moment = require('moment'),
    Socket = require('./socket'),
    osHostname = require('os').hostname(),
    FACILITY = sharedConstants.FACILITY,
    SEVERITY = sharedConstants.SEVERITY;

class Syslog extends Socket {

  constructor (config) {
    if (typeof config !== 'object') {
      config = {};
    }

    super(config);

    this.setFacility(config.facility)
        .setHostname(config.hostname)
        .setAppName(config.appName);
  }

  setFacility (facility) {
    this.facility = (typeof facility === 'number') ? facility : FACILITY.USER;

    return this;
  }

  setHostname (hostname) {
    this.hostname = hostname || osHostname;

    return this;
  }

  setAppName (appName) {
    this.appName = appName || 'highlogger';

    return this;
  }

  log (message, options, callback) {
    super.log(this.prepareMessage(message, options), options, callback);
  }

  prepareMessage (message, options) {
    if (typeof options.date === 'undefined') {
      options.date = new Date();
    }
    options.date = moment(options.date).format();

    return message;
  }
}

module.exports = Syslog;