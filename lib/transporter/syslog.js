"use strict";

let sharedConstants = require('../shared-constants'),
    moment = require('moment'),
    dgram,
    osHostname = require('os').hostname(),
    FACILITY = sharedConstants.FACILITY,
    SEVERITY = sharedConstants.SEVERITY;

class Syslog {

  constructor (config) {
    if (typeof config !== 'object') {
      config = {};
    }

    this.setFacility(config.facility)
        .setHostname(config.hostname)
        .setAppName(config.appName)
        .setAddress(config.address)
        .setPort(config.port)
        .setMethod(config.method)
        .setSeverityLevel(config.severityLevel);
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

  setMethod (method) {
    if (typeof method === 'undefined') {
      method = 'udp';
    }

    if (typeof method !== 'string') {
      throw new Error('unsupported method');
    }

    switch (method) {
      case 'udp':
        this.method = 'udp';
        break;

      default:
        throw new Error(`unsupported method ${method}`);
    }

    return this;
  }

  setAddress (address) {
    this.address = address || '127.0.0.1';

    return this;
  }

  setPort (port) {
    this.port = (typeof port === 'number') ? port : 514;

    return this;
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

    if (typeof options.date === 'undefined') {
      options.date = new Date();
    }
    options.date = moment(options.date).format();


    console.log(options);

    callback();
  }
}

module.exports = Syslog;