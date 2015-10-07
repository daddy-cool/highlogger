'use strict';

let sharedConstants = require('../shared-constants'),
    moment = require('moment'),
    Socket = require('./socket'),
    util = require('util'),
    osHostname = require('os').hostname(),
    FACILITY = sharedConstants.FACILITY,
    nil = '-',
    space = ' ';

class Syslog extends Socket {

  /**
   * @param {Object} config
   */
  constructor (config) {
    if (typeof config !== 'object') {
      config = {};
    }

    super(config);

    this.setFacility(config.facility)
        .setHostname(config.hostname)
        .setAppName(config.appName)
        .setProcessId(config.processId);
  }

  /**
   * @param {number} [facility]
   * @returns {Syslog}
   */
  setFacility (facility) {
    this.facility = (typeof facility === 'number') ? parseInt(facility, 10) * 8 : FACILITY.USER * 8;

    return this;
  }

  /**
   * @param {string} [hostname]
   * @returns {Syslog}
   */
  setHostname (hostname) {
    this.hostname = hostname || osHostname || nil;

    if (this.hostname.length > 255) {
      this.hostname = this.hostname.substring(0, 255);
    }

    return this;
  }

  /**
   * @param {string} [appName]
   * @returns {Syslog}
   */
  setAppName (appName) {
    this.appName = appName || nil;

    if (this.hostname.length > 48) {
      this.hostname = this.hostname.substring(0, 48);
    }

    return this;
  }

  /**
   * @param {string} [pId]
   * @returns {Syslog}
   */
  setProcessId (pId) {
    this.processId = pId || process.pid;

    if (this.processId.length > 128) {
      this.hostname = this.processId.substring(0, 128);
    }

    return this;
  }

  /**
   * @param {string} message
   * @param {Object} options
   * @param {Function} callback
   */
  write (message, options, callback) {
    if (typeof options.date === 'undefined') {
      options.date = new Date();
    }
    //noinspection JSUnresolvedFunction
    options.date = moment(options.date).format();

    if (typeof options.messageId === 'undefined') {
      options.messageId = nil;
    } else {
      options.messageId = util.format(options.messageId);
    }
    if (options.messageId.length > 32) {
      options.messageId = options.messageId.substring(0, 32);
    }

    if (typeof options.structuredData === 'undefined') {
      options.structuredData = nil;
    }

    super.write(
      '<' + (this.facility + options.severity) + '>1 ' + options.date + space + this.hostname + space + this.appName
      + space + this.processId + space + options.messageId + space + options.structuredData + space + message,
      options,
      callback
    );
  }
}

module.exports = Syslog;